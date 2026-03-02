import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import ExamViewer from './ExamViewer';
import Login from './Login';
import Register from './Register';
import './App.scss';

function App() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseExams, setCourseExams] = useState([]);
  const [view, setView] = useState('courses'); // 'courses' or 'admin' or 'exams' or 'takeExam' or 'courseDetail' or 'login' or 'register' or 'profile'
  const [user, setUser] = useState(null); // logged-in user info

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    axios.get('http://localhost:8000/courses/')
      .then(response => setCourses(response.data))
      .catch(err => console.error(err));
  };

  const fetchExams = () => {
    axios.get('http://localhost:8000/exams/')
      .then(response => setExams(response.data))
      .catch(err => console.error(err));
  };

  const goToAdmin = () => {
    setView('admin');
  };

  const goToCourses = () => {
    setView('courses');
    fetchCourses(); // refresh list when coming back from admin
  };

  const goToExams = () => {
    setView('exams');
    fetchExams();
  };

  const takeExam = (exam) => {
    // fetch detailed exam including questions/options
    axios.get(`http://localhost:8000/exams/${exam.id}`)
      .then(resp => {
        setSelectedExam(resp.data);
        setView('takeExam');
      })
      .catch(err => console.error(err));
  };

  const viewCourse = (course) => {
    setSelectedCourse(course);
    // filter or fetch exams for this course
    axios.get('http://localhost:8000/exams/')
      .then(resp => {
        const examsFor = resp.data.filter(e => e.course_id === course.id);
        setCourseExams(examsFor);
        setView('courseDetail');
      })
      .catch(err => console.error(err));
  };

  const backToExams = () => {
    setSelectedExam(null);
    setView('exams');
    fetchExams();
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="app-nav navbar navbar-expand-lg">
        <h1 className="app-title">📚 WebLearning</h1>
        <div className="app-nav-buttons">
          {user && (
            <>
              <button
                className={`app-nav-button${view === 'courses' ? ' active' : ''}`}
                onClick={goToCourses}
              >
                Kurslar
              </button>
              <button
                className={`app-nav-button${view === 'exams' ? ' active' : ''}`}
                onClick={goToExams}
              >
                Imtixon
              </button>
            </>
          )}
          {user?.is_admin && (
            <button
              className={`app-nav-button${view === 'admin' ? ' active' : ''}`}
              onClick={goToAdmin}
            >
              Admin
            </button>
          )}
          {user ? (
            <button
              className={`app-nav-button${view === 'profile' ? ' active' : ''}`}
              onClick={() => setView('profile')}
            >
              Profil
            </button>
          ) : (
            <>
              <button
                className={`app-nav-button${view === 'login' ? ' active' : ''}`}
                onClick={() => setView('login')}
              >
                Kirish
              </button>
              <button
                className={`app-nav-button${view === 'register' ? ' active' : ''}`}
                onClick={() => setView('register')}
              >
                Ro'yxatdan o'tish
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="app-content">
        {view === 'courses' && (
          <div>
            {!user ? (
              <p>Iltimos, kurslar va imtihonlarni ko'rish uchun kirish qiling.</p>
            ) : (
              <>
                <h2>Mavjud Kurslar</h2>
                {courses.length === 0 ? (
                  <p>Hozircha kurslar mavjud emas.</p>
                ) : (
                  <ul className="course-list-simple">
                    {courses.map(course => (
                      <li
                        key={course.id}
                        className="course-list-item"
                        onClick={() => viewCourse(course)}
                      >
                        <div>
                          <strong>{course.title}</strong>
                          <div className="text-muted">{course.description}</div>
                        </div>
                        {course.video_url && <div className="text-primary">▶ Video</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
        {view === 'courseDetail' && selectedCourse && (
          <div>
            <button className="btn btn-secondary mb-3" onClick={goToCourses}>
              ← Kurslar ro'yxatiga qaytish
            </button>
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description}</p>
            {selectedCourse.video_url && (
              <video width="100%" height="480" controls className="app-video">
                <source src={`http://localhost:8000${selectedCourse.video_url}`} type="video/mp4" />
                Video qo'llab-quvvatlanmaydi.
              </video>
            )}
            <h3>Kursga doir imtixonlar</h3>
            {courseExams.length === 0 ? (
              <p>Bu kursga imtixonlar mavjud emas.</p>
            ) : (
              <ul>
                {courseExams.map(ex => (
                  <li
                    key={ex.id}
                    className="app-exam-item"
                    onClick={() => takeExam(ex)}
                  >
                    {ex.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {view === 'exams' && (
          <div>
            {!user ? (
              <p>Iltimos, imtixonlarni ko'rish uchun kirish qiling.</p>
            ) : (
              <>
                <h2>Imtixonlar</h2>
                {exams.length === 0 ? (
                  <p>Hozircha imtixonlar mavjud emas.</p>
                ) : (
                  <ul>
                    {exams.map(exam => (
                      <li
                        key={exam.id}
                        className="app-exam-item"
                        onClick={() => takeExam(exam)}
                      >
                        {exam.title} (kurs ID: {exam.course_id})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {view === 'takeExam' && selectedExam && (
          <ExamViewer exam={selectedExam} onBack={backToExams} />
        )}

        {view === 'admin' && user?.is_admin && <AdminPanel />}

        {view === 'login' && <Login onLoginSuccess={(u) => { setUser(u); setView('courses'); }} onSwitchToRegister={() => setView('register')} />}
        {view === 'register' && <Register onRegisterSuccess={() => setView('login')} onSwitchToLogin={() => setView('login')} />}
        {view === 'profile' && user && (
          <div className="p-4">
            <h2>Profil</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Ism:</strong> {user.full_name}</p>
            <p><strong>Role:</strong> {user.is_admin ? 'Admin' : 'Oquvchi'}</p>
            <button
              onClick={() => { setUser(null); setView('courses'); }}
              className="btn btn-danger mt-2"
            >
              Chiqish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

