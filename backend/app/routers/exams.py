from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Exam)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(get_db)):
    db_course = db.query(models.Course).filter(models.Course.id == exam.course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    db_exam = models.Exam(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@router.get("/", response_model=list[schemas.Exam])
def list_exams(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.Exam).offset(skip).limit(limit).all()

@router.get("/{exam_id}", response_model=schemas.Exam)
def read_exam(exam_id: int, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return db_exam

@router.post("/{exam_id}/questions", response_model=schemas.Question)
def add_question(exam_id: int, question: schemas.Question, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db_question = models.Question(text=question.text, exam_id=exam_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    # create options if provided
    for opt in question.options:
        db_opt = models.Option(text=opt.text, is_correct=1 if opt.is_correct else 0, question_id=db_question.id)
        db.add(db_opt)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/questions/{question_id}/options", response_model=schemas.Option)
def add_option(question_id: int, option: schemas.Option, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    db_opt = models.Option(text=option.text, is_correct=1 if option.is_correct else 0, question_id=question_id)
    db.add(db_opt)
    db.commit()
    db.refresh(db_opt)
    return db_opt
