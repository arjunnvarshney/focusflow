from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import List
from database import get_db
from models import Task

router = APIRouter()

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    fail_count: int
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TaskResponse])
def get_tasks(db: DBSession = Depends(get_db)):
    return db.query(Task).all()

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: DBSession = Depends(get_db)):
    db_task = Task(title=task.title)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: DBSession = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task: raise HTTPException(status_code=404)
    db_task.status = task.status
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: DBSession = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task: raise HTTPException(status_code=404)
    db.delete(db_task)
    db.commit()
    return {"status": "deleted"}

@router.post("/{task_id}/fail")
def fail_task(task_id: int, db: DBSession = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task: raise HTTPException(status_code=404)
    db_task.fail_count += 1
    db.commit()
    return {"fail_count": db_task.fail_count}

@router.get("/resurface", response_model=List[TaskResponse])
def get_resurfaced_tasks(db: DBSession = Depends(get_db)):
    return db.query(Task).filter(Task.fail_count > 0, Task.status != "done").all()
