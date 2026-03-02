import React, { useState } from 'react';
import axios from 'axios';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!email || !password || !fullName) {
        setMessage('❌ Barcha maydonlarni to\'ldiring');
        setLoading(false);
        return;
      }

      if (password !== passwordConfirm) {
        setMessage('❌ Parollar mos kelmadi');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage('❌ Parol hech bo\'lmaganda 6 ta belgidan iborat bo\'lishi kerak');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8000/users/register', {
        email,
        password,
        full_name: fullName,
        is_admin: userType === 'admin',
      });

      if (response.data.success) {
        setMessage('✅ Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Logindan foydalanib kirishingiz mumkin.');
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      } else {
        setMessage('❌ ' + (response.data.message || 'Ro\'yxatdan o\'tishda xatolik'));
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage('❌ Bu email allaqachon ro\'yxatdan o\'tgan');
      } else {
        setMessage('❌ ' + (error.response?.data?.detail || 'Xatolik: ' + error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📚 WebLearning Register</h2>
        
        <div style={styles.userTypeSelector}>
          <label style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              value="user"
              checked={userType === 'user'}
              onChange={(e) => setUserType(e.target.value)}
            />
            {' '}O'quvchi
          </label>
          <label>
            <input
              type="radio"
              value="admin"
              checked={userType === 'admin'}
              onChange={(e) => setUserType(e.target.value)}
            />
            {' '}Admin
          </label>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>To'liq Ismi</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ismingizni kiriting"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email manzilingizni kiriting"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kuchli parol yarating"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Parolni Qayta Kiriting</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Parolni qayta kiriting"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Jarayon...' : 'Ro\'yxatdan O\'tish'}
          </button>
        </form>

        {message && (
          <p style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
          }}>
            {message}
          </p>
        )}

        <p style={styles.footer}>
          Allaqachon akkauntingiz bormi?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={styles.linkButton}
          >
            Kirish
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: '#282c34',
    marginBottom: '1.5rem',
    fontSize: '1.8rem',
  },
  userTypeSelector: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
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
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '0.25rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '4px',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#666',
  },
  linkButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '1rem',
  },
};

export default Register;
