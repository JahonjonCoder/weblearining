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
    # include question_count if provided
    data = exam.dict()
    db_exam = models.Exam(**data)
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


@router.put("/{exam_id}", response_model=schemas.Exam)
def update_exam(exam_id: int, exam_update: schemas.ExamCreate, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # validate course exists
    db_course = db.query(models.Course).filter(models.Course.id == exam_update.course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    db_exam.title = exam_update.title
    db_exam.description = exam_update.description
    db_exam.course_id = exam_update.course_id
    db_exam.question_count = getattr(exam_update, 'question_count', db_exam.question_count)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam


@router.patch("/{exam_id}", response_model=schemas.Exam)
def update_exam_partial(exam_id: int, exam_update: dict, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # Update only provided fields
    if "title" in exam_update:
        db_exam.title = exam_update["title"]
    if "description" in exam_update:
        db_exam.description = exam_update["description"]
    if "question_count" in exam_update:
        db_exam.question_count = exam_update["question_count"]
    if "time_limit" in exam_update:
        db_exam.time_limit = exam_update["time_limit"]
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam


@router.delete("/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # delete related questions and options
    for q in db_exam.questions:
        db.query(models.Option).filter(models.Option.question_id == q.id).delete()
    db.query(models.Question).filter(models.Question.exam_id == exam_id).delete()
    db.delete(db_exam)
    db.commit()
    return {"success": True}

@router.post("/{exam_id}/questions", response_model=schemas.Question)
def add_question(exam_id: int, question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db_question = models.Question(text=question.text, exam_id=exam_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    # create options if provided
    for opt in question.options:
        db_opt = models.Option(text=opt.text, is_correct=opt.is_correct, question_id=db_question.id)
        db.add(db_opt)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/questions/{question_id}/options", response_model=schemas.Option)
def add_option(question_id: int, option: schemas.OptionCreate, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    db_opt = models.Option(text=option.text, is_correct=option.is_correct, question_id=question_id)
    db.add(db_opt)
    db.commit()
    db.refresh(db_opt)
    return db_opt


@router.put("/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: int, question_update: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    db_question.text = question_update.text
    # update options: delete existing then recreate for simplicity
    db.query(models.Option).filter(models.Option.question_id == question_id).delete()
    for opt in question_update.options:
        db_opt = models.Option(text=opt.text, is_correct=opt.is_correct, question_id=question_id)
        db.add(db_opt)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.query(models.Option).filter(models.Option.question_id == question_id).delete()
    db.delete(db_question)
    db.commit()
    return {"success": True}


@router.put("/options/{option_id}", response_model=schemas.Option)
def update_option(option_id: int, option_update: schemas.OptionCreate, db: Session = Depends(get_db)):
    db_opt = db.query(models.Option).filter(models.Option.id == option_id).first()
    if not db_opt:
        raise HTTPException(status_code=404, detail="Option not found")
    db_opt.text = option_update.text
    db_opt.is_correct = option_update.is_correct
    db.add(db_opt)
    db.commit()
    db.refresh(db_opt)
    return db_opt


@router.delete("/options/{option_id}")
def delete_option(option_id: int, db: Session = Depends(get_db)):
    db_opt = db.query(models.Option).filter(models.Option.id == option_id).first()
    if not db_opt:
        raise HTTPException(status_code=404, detail="Option not found")
    db.delete(db_opt)
    db.commit()
    return {"success": True}


# Section endpoints
@router.post("/{exam_id}/sections", response_model=schemas.Section)
def create_section(exam_id: int, section: schemas.SectionCreate, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db_section = models.Section(
        title=section.title,
        description=section.description,
        exam_id=exam_id,
        order=section.order
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section


@router.get("/{exam_id}/sections", response_model=list[schemas.Section])
def list_sections(exam_id: int, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return db.query(models.Section).filter(models.Section.exam_id == exam_id).order_by(models.Section.order).all()


@router.put("/sections/{section_id}", response_model=schemas.Section)
def update_section(section_id: int, section_update: schemas.SectionBase, db: Session = Depends(get_db)):
    db_section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    db_section.title = section_update.title
    db_section.description = section_update.description
    db_section.order = section_update.order
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section


@router.delete("/sections/{section_id}")
def delete_section(section_id: int, db: Session = Depends(get_db)):
    db_section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    db.query(models.Question).filter(models.Question.section_id == section_id).update({models.Question.section_id: None})
    db.delete(db_section)
    db.commit()
    return {"success": True}


# Test Result endpoints
@router.post("/results", response_model=schemas.TestResult)
def submit_test_result(result: schemas.TestResultCreate, db: Session = Depends(get_db)):
    db_result = models.TestResult(
        user_id=result.user_id,
        exam_id=result.exam_id,
        score=result.score,
        passed=result.passed,
        time_taken=result.time_taken
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.get("/{exam_id}/results", response_model=list[schemas.TestResult])
def get_exam_results(exam_id: int, db: Session = Depends(get_db)):
    db_exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return db.query(models.TestResult).filter(models.TestResult.exam_id == exam_id).all()


@router.get("/users/{user_id}/results", response_model=list[schemas.TestResult])
def get_user_results(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.TestResult).filter(models.TestResult.user_id == user_id).all()
