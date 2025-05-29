from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from model import  Alert, StatisticTable,logsTable
from datetime import datetime
from typing import List
from auth_utility import TokenSchema,decode_access_toke
router = APIRouter()

@router.post("/logs_alert_statistic")
def get_combined_logs(token : TokenSchema,db: Session = Depends(get_db)):
    logs = []
    data = decode_access_toke(token.token_id)
    email = data['key']

    # Alerts
    alerts = db.query(Alert).all()
    for a in alerts:
        logs.append({
            "message": f"{a.alert_type} - {a.description}",
            "type": "ALERT",
            "timestamp": a.created_at,
            "source": a.packet_id or "alert_system"
        })

    # Statistics
    stats = db.query(StatisticTable).all()
    for s in stats:
        logs.append({
            "message": f"Statistic recorded: {s.total_packet} packets, SYN scans: {s.syn_scan}, DDoS: {s.ddos_attempt}",
            "type": "STAT",
            "timestamp": s.time,
            "source": "stat_collector"
        })

    # Sort logs by timestamp descending
    logs.sort(key=lambda x: x["timestamp"], reverse=True)

    # Add each log entry to the database
    for log in logs:
        data = logsTable(
            message=log['message'],
            type=log['type'],
            timestamp=log['timestamp'],
            source=log.get('source', ''),
            email= email
        )
        db.add(data)

    db.commit()  # Commit all at once

    return logs
