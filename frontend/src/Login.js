import React, { useState } from 'react';
import axios from 'axios';
import './Login.scss';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const resp = await axios.post('http://localhost:8000/users/login', {
        email,
        password,
      });

      if (resp.data?.success) {
        setMessage('✅ Kirish muvaffaqiyatli');
        onLoginSuccess(resp.data.user);
      } else {
        setMessage('❌ Kirishda xatolik');
      }
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Kirish</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary login-button">
            {loading ? 'Jarayon...' : 'Kirish'}
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

        <p className="login-footer">
          Ro'yxatdan o'tmaganmisiz?{' '}
          <button onClick={onSwitchToRegister} className="login-link">
            Ro'yxatdan o'tish
          </button>
        </p>
      </div>
    </div>
  );
}


export default Login;
