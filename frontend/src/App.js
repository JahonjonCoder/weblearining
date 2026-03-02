import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import ExamViewer from './ExamViewer';

function App() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [view, setView] = useState('courses'); // 'courses' or 'admin' or 'exams' or 'takeExam'

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

  const backToExams = () => {
    setSelectedExam(null);
    setView('exams');
    fetchExams();
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Navigation Bar */}
      <nav style={styles.nav}>
        <h1 style={styles.title}>📚 WebLearning</h1>
        <div style={styles.navButtons}>
          <button onClick={goToCourses} style={view === 'courses' ? { ...styles.navButton, ...styles.active } : styles.navButton}>
            Kurslar
          </button>
          <button onClick={goToExams} style={view === 'exams' ? { ...styles.navButton, ...styles.active } : styles.navButton}>
            Imtixon
          </button>
          <button onClick={goToAdmin} style={view === 'admin' ? { ...styles.navButton, ...styles.active } : styles.navButton}>
            Admin
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        {view === 'courses' && (
          <div>
            <h2>Mavjud Kurslar</h2>
            {courses.length === 0 ? (
              <p>Hozircha kurslar mavjud emas.</p>
            ) : (
              <div style={styles.courseList}>
                {courses.map(course => (
                  <div key={course.id} style={styles.courseCard}>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    {course.video_url && (
                      <video width="100%" height="200" controls style={styles.video}>
                        <source src={`http://localhost:8000${course.video_url}`} type="video/mp4" />
                        Video fayli qo'llab-quvvatlanmaydi
                      </video>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'exams' && (
          <div>
            <h2>Imtixonlar</h2>
            {exams.length === 0 ? (
              <p>Hozircha imtixonlar mavjud emas.</p>
            ) : (
              <ul>
                {exams.map(exam => (
                  <li key={exam.id} style={styles.examItem} onClick={() => takeExam(exam)}>
                    {exam.title} (kurs ID: {exam.course_id})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {view === 'takeExam' && selectedExam && (
          <ExamViewer exam={selectedExam} onBack={backToExams} />
        )}

        {view === 'admin' && <AdminPanel />}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    backgroundColor: '#282c34',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  navButtons: {
    display: 'flex',
    gap: '1rem',
  },
  navButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  examItem: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  active: {
    backgroundColor: 'white',
    color: '#282c34',
  },
  content: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  courseList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  courseCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  video: {
    marginTop: '1rem',
    borderRadius: '4px',
  },
};

export default App;

