import React, { useState } from 'react';
import axios from 'axios';
import QuestionForm from './QuestionForm';
import './AdminPanel.scss';

function AdminPanel() {
  const [mode, setMode] = useState('course'); // 'course' or 'exam'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTitle('');
    setDescription('');
    setVideo(null);
    setCourseId('');
    setMessage('');
    setEditingExam(null);
    setEditingCourse(null);
  };

  React.useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = () => {
    axios.get('http://localhost:8000/exams/')
      .then(resp => setExams(resp.data))
      .catch(err => console.error(err));
  };

  const fetchCourses = () => {
    axios.get('http://localhost:8000/courses/')
      .then(resp => setCourses(resp.data))
      .catch(err => console.error(err));
  };

  const fetchQuestions = (examId) => {
    axios.get(`http://localhost:8000/exams/${examId}`)
      .then(resp => setQuestions(resp.data.questions || []))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setMessage(mode === 'course' ? 'Kurs nomi kiritilishi kerak' : 'Imtixon nomi kiritilishi kerak');
      return;
    }

    if (mode === 'exam' && !courseId) {
      setMessage('Kurs ID kiritilishi kerak');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      if (mode === 'course') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('owner_id', 1); // default user
        if (video) {
          formData.append('video', video);
        }

        if (editingCourse) {
          // update course
          await axios.put(`http://localhost:8000/courses/${editingCourse.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setMessage('✅ Kurs muvaffaqiyatli yangilandi!');
        } else {
          // create course
          const response = await axios.post('http://localhost:8000/courses/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setMessage('✅ Kurs muvaffaqiyatli qo\'shildi!');
        }

        setTitle('');
        setDescription('');
        setVideo(null);
        setEditingCourse(null);
        document.getElementById('videoInput').value = '';
        fetchCourses();
      } else {
        // exam mode
        const payload = { title, description, course_id: parseInt(courseId, 10) };
        if (editingExam) {
          // update
          await axios.put(`http://localhost:8000/exams/${editingExam.id}`, payload);
          setMessage('✅ Imtixon muvaffaqiyatli yangilandi!');
        } else {
          await axios.post('http://localhost:8000/exams/', payload);
          setMessage('✅ Imtixon muvaffaqiyatli qo\'shildi!');
        }
        setTitle('');
        setDescription('');
        setCourseId('');
        setEditingExam(null);
        fetchExams();
      }
    } catch (error) {
      setMessage(`❌ Xatolik: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditCourse = (course) => {
    setMode('course');
    setEditingCourse(course);
    setTitle(course.title || '');
    setDescription(course.description || '');
    setVideo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const manageQuestions = (exam) => {
    setEditingExam(exam);
    fetchQuestions(exam.id);
    setMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm('Kursni oʻchirib tashlamoqchimisiz?')) return;
    try {
      await axios.delete(`http://localhost:8000/courses/${course.id}`);
      setMessage('✅ Kurs oʻchirildi');
      fetchCourses();
    } catch (err) {
      setMessage('❌ Oʻchirishda xatolik: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEdit = (exam) => {
    setMode('exam');
    setEditingExam(exam);
    setTitle(exam.title || '');
    setDescription(exam.description || '');
    setCourseId(exam.course_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (exam) => {
    if (!window.confirm('Imtixonni oʻchirib tashlamoqchimisiz?')) return;
    try {
      await axios.delete(`http://localhost:8000/exams/${exam.id}`);
      setMessage('✅ Imtixon oʻchirildi');
      fetchExams();
    } catch (err) {
      setMessage('❌ Oʻchirishda xatolik: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <div className="mb-3">
        <button
          type="button"
          onClick={() => handleModeChange('course')}
          className={`admin-tab${mode === 'course' ? ' active' : ''}`}
        >
          Kurs Qo'shish
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('exam')}
          className={`admin-tab${mode === 'exam' ? ' active' : ''}`}
        >
          Imtixon Qo'shish
        </button>
      </div>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-group mb-3">
          <label>{mode === 'course' ? 'Kurs Nomi *' : 'Imtixon Nomi *'}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === 'course' ? 'Kurs nomini kiriting' : 'Imtixon nomini kiriting'}
            className="admin-input form-control"
          />
        </div>
        {mode === 'exam' && (
          <div className="admin-form-group mb-3">
            <label>Kurs ID *</label>
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Imtixoningiz qaysi kursga tegishli"
              className="admin-input form-control"
            />
          </div>
        )}

        <div className="admin-form-group mb-3">
          <label>Tavsifi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurs haqida izoh yozing"
            className="admin-textarea form-control"
            rows="4"
          />
        </div>

        {mode === 'course' && (
          <div className="admin-form-group mb-3">
            <label>Video Fayli</label>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="admin-input form-control"
            />
            {video && <p className="admin-file-name">Tanlanganh: {video.name}</p>}
          </div>
        )}

        <button type="submit" disabled={uploading} className="admin-button btn">
          {uploading
            ? 'Jarayon...'
            : mode === 'course'
            ? editingCourse
              ? 'Kursni Yangilash'
              : "Kurs Qo'shish"
            : editingExam
            ? 'Imtixonni Yangilash'
            : "Imtixon Qo'shish"}
        </button>
      </form>

      {message && <p className="admin-message">{message}</p>}

      <div className="mt-4">
        <h3>Kurslar</h3>
        {courses.length === 0 ? (
          <p>Hozircha kurslar mavjud emas.</p>
        ) : (
          <ul className="list-unstyled">
            {courses.map((course) => (
              <li
                key={course.id}
                className="py-2 border-bottom d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{course.title}</strong>
                  <div className="small text-muted">{course.description}</div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="btn btn-warning"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="btn btn-danger"
                  >
                    O'chirish
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <h3>Imtixonlar</h3>
        {exams.length === 0 ? (
          <p>Hozircha imtixonlar mavjud emas.</p>
        ) : (
          <ul className="list-unstyled">
            {exams.map((ex) => (
              <li
                key={ex.id}
                className="py-2 border-bottom d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{ex.title}</strong>
                  <div className="small text-muted">Course ID: {ex.course_id}</div>
                </div>
                <div className="d-flex gap-2">
                  <button onClick={() => handleEdit(ex)} className="btn btn-warning">
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => manageQuestions(ex)}
                    className="btn btn-secondary"
                  >
                    Savollar
                  </button>
                  <button onClick={() => handleDelete(ex)} className="btn btn-danger">
                    O'chirish
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {editingExam && (
        <div className="mt-4 p-3 border rounded">
          <h3>Imtixon: {editingExam.title} uchun savollar</h3>
          <QuestionForm
            examId={editingExam.id}
            questions={questions}
            setQuestions={setQuestions}
            editingQuestion={editingQuestion}
            setEditingQuestion={setEditingQuestion}
            refreshQuestions={() => fetchQuestions(editingExam.id)}
          />
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
