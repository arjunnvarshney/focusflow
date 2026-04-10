from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from database import get_db
from models import Session, Event
from services.focus_engine import FocusEngine
from services.ai_summary import generate_summary

router = APIRouter()
active_engines = {}

class EventCreate(BaseModel):
    session_id: int
    event_type: str

class SessionResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: int
    distraction_count: int
    focus_score: float
    ai_summary: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("/start", response_model=SessionResponse)
def start_session(db: DBSession = Depends(get_db)):
    db_session = Session()
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    engine = FocusEngine()
    engine.start_session()
    active_engines[db_session.id] = engine
    return db_session

@router.post("/event")
def log_event(event: EventCreate, db: DBSession = Depends(get_db)):
    db_session = db.query(Session).filter(Session.id == event.session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db_event = Event(session_id=event.session_id, event_type=event.event_type)
    db.add(db_event)
    db.commit()
    
    engine = active_engines.get(event.session_id)
    if engine:
        engine.transition(event.event_type)
    return {"status": "event logged"}

@router.post("/end/{session_id}", response_model=SessionResponse)
async def end_session(session_id: int, db: DBSession = Depends(get_db)):
    db_session = db.query(Session).filter(Session.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if db_session.end_time is not None:
        return db_session
        
    db_session.end_time = datetime.now(timezone.utc).replace(tzinfo=None)
    duration = (db_session.end_time - db_session.start_time).total_seconds()
    db_session.duration_seconds = int(duration)
    
    engine = active_engines.pop(session_id, None)
    distractions = 0
    score = 100.0
    if engine:
        summary_data = engine.get_summary_data()
        distractions = summary_data["count"]
        score = summary_data["score"]
        
    db_session.distraction_count = distractions
    db_session.focus_score = score
    
    events = db.query(Event).filter(Event.session_id == session_id).all()
    event_list = [{"type": e.event_type, "time": e.timestamp.isoformat()} for e in events]
    
    db_session.ai_summary = await generate_summary(db_session.duration_seconds, db_session.distraction_count, event_list)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    db_session = db.query(Session).filter(Session.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session

@router.get("/", response_model=List[SessionResponse])
def get_sessions(db: DBSession = Depends(get_db)):
    return db.query(Session).order_by(Session.id.desc()).all()
