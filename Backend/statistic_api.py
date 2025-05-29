from sqlalchemy.orm import Session
from model import StatisticTable, Alert, packet_details, User_Detail
from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from auth_utility import TokenSchema,decode_access_toke
from sqlalchemy import func
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/statistic")
def get_statistics(token:TokenSchema,db: Session = Depends(get_db)):
    try:
        data = decode_access_toke(token.token_id)
        email = data['key']
        # Get current time and time 24 hours ago for time-based stats
        now = datetime.now()
        twenty_four_hours_ago = now - timedelta(hours=24)
        
        # Get total packet count
        total_packets = db.query(func.count(packet_details.id)).scalar()
        
        # Get SYN scan alerts count (with time filter)
        syn_scans = db.query(func.count(Alert.id)).filter(
            Alert.alert_type == 'SYN Flood',
            Alert.created_at >= twenty_four_hours_ago
        ).scalar()
        
        # Get DDoS attempt alerts count (with time filter)
        ddos_attempts = db.query(func.count(Alert.id)).filter(
            Alert.alert_type == "DDoS Attempt",
            Alert.created_at >= twenty_four_hours_ago
        ).scalar()
        
        # Get suspicious IPs (IPs that generated alerts in last 24 hours)
        suspicious_ips = db.query(
            packet_details.source
        ).join(
            Alert
        ).filter(
            Alert.created_at >= twenty_four_hours_ago
        ).group_by(
            packet_details.source
        ).all()
        
        suspicious_ip_list = [ip[0] for ip in suspicious_ips]
 #Joins all IPs into a single string separated by commas
# Example: "192.168.1.1, 10.0.0.5, 172.16.0.3" 
        # Create a new statistic record
        new_stat = StatisticTable(
            total_packet=total_packets,
            syn_scan=syn_scans,
            ddos_attempt=ddos_attempts,
            suspicious_ip=", ".join(suspicious_ip_list) if suspicious_ip_list else "None",
            time=now,
            email = email

        )
        
        db.add(new_stat)
        db.commit()
        
        return {
            "total_packets": total_packets,
            "syn_scans_last_24h": syn_scans,
            "ddos_attempts_last_24h": ddos_attempts,
            "suspicious_ips": suspicious_ip_list  # Return the list instead of query object
        }
    except Exception as e:
        db.rollback()  # Important to rollback on error
        raise HTTPException(status_code=500, detail=str(e))