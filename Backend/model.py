from sqlalchemy import Integer, String, Column, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base  # Base class for declarative models

# User model storing profile info
class User_Detail(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, index=True, unique=True)
    password = Column(String, index=True)
    
    # Added relationship for alerts
    alerts = relationship("Alert", back_populates="user")

# Model to store packet capture details
class packet_details(Base):
    __tablename__ = "packetDetails"
    id = Column(String, primary_key=True, index=True)
    source = Column(String, index=True)           # Source IP address
    destination = Column(String, index=True)      # Destination IP address
    protocol = Column(String, index=True)         # IP protocol used
    length = Column(Integer, index=True)          # Packet length
    flags = Column(String, index=True)            # TCP flags
    summary = Column(String, index=True)          # Packet summary from Scapy
    email = Column(String, ForeignKey("profile.email"))  # Link to user profile
    
    # Added relationship for alerts
    alerts = relationship("Alert", back_populates="packet")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), index=True, nullable=False)
    severity = Column(String(20), index=True)  # e.g., 'low', 'medium', 'high'
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) #This is defining a database column that automatically records timestamps when new records are created. Think of it like an automatic timestamp stamp.
    
    # Corrected foreign keys to match your actual table names
    user_email = Column(String, ForeignKey("profile.email"), nullable=False)  # Changed from user_id
    packet_id = Column(String, ForeignKey("packetDetails.id"))  # Matches your table name
    
    # Corrected relationships to match your actual class names
    user = relationship("User_Detail", back_populates="alerts")  # Changed from "User"
    packet = relationship("packet_details", back_populates="alerts")  # Changed from "Packet"



class StatisticTable(Base):
    __tablename__ = 'statistic'

    id = Column(Integer, primary_key=True, index=True)
    total_packet = Column(Integer, index=True)
    syn_scan = Column(Integer, index=True)
    ddos_attempt = Column(Integer, index=True)
    suspicious_ip = Column(String, index=True)
    time = Column(DateTime(timezone=True), index=True)
    email = Column(String, ForeignKey("profile.email"))  # Link to user profile

class logsTable(Base):
    __tablename__ = 'logsTable'

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    type = Column(String(20), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    source = Column(String, nullable=True)  # Ensure source is present and nullable
    email = Column(String, ForeignKey("profile.email"))  # Link to user profile