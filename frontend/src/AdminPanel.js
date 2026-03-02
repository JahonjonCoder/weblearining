import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [mode, setMode] = useState('course'); // 'course' or 'exam'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

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

        const response = await axios.post('http://localhost:8000/courses/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setMessage('✅ Kurs muvaffaqiyatli qo\'shildi!');
        setTitle('');
        setDescription('');
        setVideo(null);
        document.getElementById('videoInput').value = '';
      } else {
        // exam mode
        const payload = { title, description, course_id: parseInt(courseId, 10) };
        const response = await axios.post('http://localhost:8000/exams/', payload);
        setMessage('✅ Imtixon muvaffaqiyatli qo\'shildi!');
        setTitle('');
        setDescription('');
        setCourseId('');
      }
    } catch (error) {
      setMessage(`❌ Xatolik: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Panel</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => handleModeChange('course')} style={mode === 'course' ? styles.activeTab : styles.tab}>
          Kurs Qo'shish
        </button>
        <button type="button" onClick={() => handleModeChange('exam')} style={mode === 'exam' ? styles.activeTab : styles.tab}>
          Imtixon Qo'shish
        </button>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>{mode === 'course' ? 'Kurs Nomi *' : 'Imtixon Nomi *'}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === 'course' ? 'Kurs nomini kiriting' : 'Imtixon nomini kiriting'}
            style={styles.input}
          />
        </div>
        {mode === 'exam' && (
          <div style={styles.formGroup}>
            <label>Kurs ID *</label>
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Imtixoningiz qaysi kursga tegishli"
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Tavsifi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurs haqida izoh yozing"
            style={styles.textarea}
            rows="4"
          />
        </div>

        {mode === 'course' && (
          <div style={styles.formGroup}>
            <label>Video Fayli</label>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={styles.input}
            />
            {video && <p style={styles.fileName}>Tanlanganh: {video.name}</p>}
          </div>
        )}

        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? 'Jarayon...' : 'Kurs Qo\'shish'}
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '2rem auto',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '0.25rem',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '0.25rem',
    fontFamily: 'sans-serif',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e8f4f8',
    borderLeft: '4px solid #007bff',
    borderRadius: '4px',
  },
  fileName: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    marginRight: '1rem',
    cursor: 'pointer',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '4px',
  },
  activeTab: {
    padding: '0.5rem 1rem',
    marginRight: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
};

export default AdminPanel;
