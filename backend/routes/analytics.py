from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from database import get_db
from models import Session
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).all()
    total_time = sum(s.duration_seconds for s in sessions)
    avg_score = sum(s.focus_score for s in sessions) / len(sessions) if sessions else 100.0
    total_xp = sum((s.duration_seconds // 60) + int(s.focus_score * 0.1) for s in sessions)
    level = (total_xp // 100) + 1
    current_level_xp = total_xp % 100
    rank = "Novice"
    if level >= 5: rank = "Apprentice"
    if level >= 10: rank = "Adept"
    if level >= 20: rank = "Master"
    if level >= 50: rank = "Grandmaster"
    return {
        "total_sessions": len(sessions),
        "total_time_seconds": total_time,
        "average_score": round(avg_score, 1),
        "xp": current_level_xp,
        "total_xp": total_xp,
        "level": level,
        "rank": rank,
        "next_level_xp": 100
    }
