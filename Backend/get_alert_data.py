from fastapi import APIRouter, HTTPException, Depends
from model import Alert
from database import get_db
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import select

router = APIRouter()

@router.post("/alert_database")
def get_alerts_from_db(db: Session = Depends(get_db)):
    try:
        # Correct way to query all alerts from the database
        alerts = db.query(Alert).all()
        
        if not alerts:
            raise HTTPException(status_code=404, detail="No alerts found in database")
        
        return alerts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alerts: {str(e)}")