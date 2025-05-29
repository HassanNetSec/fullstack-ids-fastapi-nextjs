from fastapi import APIRouter, HTTPException
from database import SessionLocal  # Database session for interacting with the DB
import threading
from scapy.all import sniff, IP, TCP, ARP  # For packet sniffing and packet analysis
from auth_utility import decode_access_toke  # Token decoder (assumed JWT or similar)
from model import packet_details  # SQLAlchemy model for packet storage
from auth_utility import TokenSchema  # Pydantic schema for token input validation
from collections import defaultdict
import time
from model import Alert
from uuid import uuid4

router = APIRouter()

# Tracking structures (initialize these globally or in a singleton service)
syn_scan_tracker = defaultdict(set)      # src_ip -> set of dst_ports
syn_flood_counter = defaultdict(int)     # src_ip -> count
arp_table = {}                           # IP -> MAC mapping
ddos_tracker = defaultdict(list)         # dst_ip -> timestamps

# Thresholds
PORT_SCAN_THRESHOLD = 10
SYN_FLOOD_THRESHOLD = 100
DDOS_PACKET_THRESHOLD = 100
DDOS_TIME_WINDOW = 10  # seconds

# Function to detect alerts
def detect_alert(packet, email,unique_id):
    alerts = []
    now = time.time()
    
    # ======================= TCP-Based Attacks =======================
    if packet.haslayer(IP) and packet.haslayer(TCP):
        ip = packet[IP]
        tcp = packet[TCP]
        src_ip = ip.src
        dst_ip = ip.dst
        dst_port = tcp.dport
        flags = tcp.flags
        
        # --- Port Scanning ---
        if flags == "S":  # SYN Scan 
            syn_scan_tracker[src_ip].add(dst_port)
            if len(syn_scan_tracker[src_ip]) > PORT_SCAN_THRESHOLD:
                alerts.append({
                    "type": "Port Scan (SYN)",
                    "severity": "medium",
                    "description": f"Source {src_ip} is scanning ports on {dst_ip}",
                    "email": email,
                    "source_Ip": src_ip,
                    "packet_id" : unique_id
                })
                
        if flags == 0:  # NULL Scan
            alerts.append({
                "type": "Port Scan (NULL)",
                "severity": "medium",
                "description": f"NULL scan detected from {src_ip} to {dst_ip}",
                "email": email,
                "source_Ip": src_ip,
                "packet_id" : unique_id
            })

        if flags == 0x29:  # XMAS Scan (FIN + PSH + URG)
            alerts.append({
                "type": "Port Scan (XMAS)",
                "severity": "medium",
                "description": f"XMAS scan detected from {src_ip} to {dst_ip}",
                "email": email,
                "source_Ip": src_ip,
                "packet_id" : unique_id
            })

        if flags == "R":  # RST Scan
            alerts.append({
                "type": "Port Scan (RST)",
                "severity": "low",
                "description": f"RST scan attempt from {src_ip} to {dst_ip}",
                "email": email,
                "source_Ip": src_ip,
                "packet_id" : unique_id
            })
            
        # --- SYN Flood Detection ---
        if flags == "S":
            syn_flood_counter[src_ip] += 1
            if syn_flood_counter[src_ip] > SYN_FLOOD_THRESHOLD:
                alerts.append({
                    "type": "SYN Flood",
                    "severity": "high",
                    "description": f"High number of SYN packets from {src_ip} (possible SYN flood)",
                    "email": email,
                    "source_Ip": src_ip,
                    "packet_id" : unique_id
                })
                
        # --- DDoS Detection ---
        ddos_tracker[dst_ip].append(now)
        # Remove timestamps outside the time window
        ddos_tracker[dst_ip] = [t for t in ddos_tracker[dst_ip] if now - t <= DDOS_TIME_WINDOW]
        if len(ddos_tracker[dst_ip]) > DDOS_PACKET_THRESHOLD:
            alerts.append({
                "type": "DDoS Attempt",
                "severity": "high",
                "description": f"Unusual traffic volume to {dst_ip} (possible DDoS)",
                "email": email,
                "source_Ip": src_ip,
                "packet_id" : unique_id
            })
            
    # ======================= ARP Spoofing =======================
    if packet.haslayer(ARP):
        arp = packet[ARP]
        if arp.op == 2:  # ARP reply
            real_mac = arp_table.get(arp.psrc)
            if real_mac and real_mac != arp.hwsrc:
                alerts.append({
                    "type": "ARP Spoofing",
                    "severity": "high",
                    "description": f"ARP Spoofing detected: IP {arp.psrc} now maps to {arp.hwsrc}, previously {real_mac}",
                    "email": email,
                    "source_Ip": arp.psrc,
                    "packet_id" : unique_id
                })
            arp_table[arp.psrc] = arp.hwsrc

    # Save to DB
    if alerts:
        save_Detail_db(alerts)

def save_Detail_db(alerts: list):
    db = SessionLocal()
    try:
        for a in alerts:
            alert = Alert(
                alert_type=a["type"],
                severity=a['severity'],
                description=a['description'],
                user_email=a['email'],
                packet_id=a['packet_id']
            )
            db.add(alert)
        db.commit()
    except Exception as e:
        print(f"Error storing alerts: {e}")
    finally:
        db.close()

# Function to store packet information in the database
def RealTimeStoreDb(packet, email):
    unique_id = str(uuid4())
    db = SessionLocal()  # Create a new DB session
    try:
        # Check if the packet contains both IP and TCP layers
        if packet.haslayer(IP) and packet.haslayer(TCP):
            # Extract relevant packet data
            packet_data = {
                "id" : unique_id,
                "source": packet[IP].src,
                "destination": packet[IP].dst,
                "protocol": packet[IP].proto,
                "flags": str(packet[TCP].flags),  # Convert flags to string
                "length": len(packet),
                "summary": packet.summary()
            }

            # Create a new record for packet_details table
            details = packet_details(
                id = packet_data["id"],
                source=packet_data.get("source"),
                destination=packet_data.get("destination"),
                protocol=packet_data.get("protocol"),
                length=packet_data.get("length"),
                flags=packet_data.get("flags"),
                summary=packet_data.get("summary"),
                email=email  # Associate packet with user email
            )

            # Add and commit the new record to the DB
            db.add(details)
            db.commit()
            db.refresh(details)  # Refresh to get DB-generated fields (like ID)
            detect_alert(packet, email,unique_id)
    except Exception as e:
        print(f"Error storing packet: {e}")
    finally:
        db.close()  # Ensure DB session is closed properly

# Function that captures packets for 30 seconds and processes each one
def Sniffer(email: str):
    # use one of your device names
    sniff(count=20, 
          prn=lambda packet: RealTimeStoreDb(packet, email), 
          store=False,
          iface=["Wi-Fi", "Ethernet"])  # or "en0" on macOS, etc.

# Endpoint to start packet capturing; runs sniffing in a background thread
@router.post("/capture_packet")
def start_capturing(token: TokenSchema):
    try:
        data = decode_access_toke(token.token_id)  # Decode token to get user info
        email = data["key"]  # Extract user email from token payload
        thread = threading.Thread(target=Sniffer, args=(email,))
        thread.start()  # Start the sniffer thread
        return {"message": "Packet capturing started"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))  # Return error if token is invalid
