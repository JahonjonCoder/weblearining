from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db
import os
import shutil
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Course)
def create_course(
    title: str = Form(...),
    description: str = Form(""),
    owner_id: int = Form(1),
    video: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    video_url = None
    if video:
        # save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{video.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        video_url = f"/uploads/{filename}"
    
    db_course = models.Course(title=title, description=description, video_url=video_url, owner_id=owner_id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/{course_id}", response_model=schemas.Course)
def read_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.get("/", response_model=list[schemas.Course])
def list_courses(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.Course).offset(skip).limit(limit).all()


@router.put("/{course_id}", response_model=schemas.Course)
def update_course(
    course_id: int,
    title: str = Form(...),
    description: str = Form(""),
    video: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db_course.title = title
    db_course.description = description
    
    if video:
        # delete old video if exists
        if db_course.video_url:
            old_path = os.path.join(UPLOAD_DIR, db_course.video_url.split("/")[-1])
            if os.path.exists(old_path):
                os.remove(old_path)
        # save new video
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{video.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        db_course.video_url = f"/uploads/{filename}"
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # delete related exams and their questions/options
    for exam in db_course.exams:
        for q in exam.questions:
            db.query(models.Option).filter(models.Option.question_id == q.id).delete()
        db.query(models.Question).filter(models.Question.exam_id == exam.id).delete()
    db.query(models.Exam).filter(models.Exam.course_id == course_id).delete()
    
    # delete video file if exists
    if db_course.video_url:
        video_path = os.path.join(UPLOAD_DIR, db_course.video_url.split("/")[-1])
        if os.path.exists(video_path):
            os.remove(video_path)
    
    db.delete(db_course)
    db.commit()
    return {"success": True}
