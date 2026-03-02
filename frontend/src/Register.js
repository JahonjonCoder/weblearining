import React, { useState } from 'react';
import axios from 'axios';
import './Register.scss';

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
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">📚 WebLearning Register</h2>

        <div className="register-user-type">
          <label className="me-3">
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

        <form onSubmit={handleSubmit} className="register-form">
          <div className="mb-3">
            <label className="form-label">To'liq Ismi</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ismingizni kiriting"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email manzilingizni kiriting"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kuchli parol yarating"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Parolni Qayta Kiriting</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Parolni qayta kiriting"
              className="form-control"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary register-button">
            {loading ? 'Jarayon...' : 'Ro\'yxatdan O\'tish'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-3 ${
              message.includes('✅') ? 'alert alert-success' : 'alert alert-danger'
            }`}
          >
            {message}
          </div>
        )}

        <p className="register-footer">
          Allaqachon akkauntingiz bormi?{' '}
          <button type="button" onClick={onSwitchToLogin} className="register-link">
            Kirish
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
