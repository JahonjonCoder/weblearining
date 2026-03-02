import React, { useState } from 'react';
import axios from 'axios';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kirish</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Parol</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Jarayon...' : 'Kirish'}</button>
        </form>

        {message && <p style={{ ...styles.message, backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24' }}>{message}</p>}

        <p style={styles.footer}>Ro'yxatdan o'tmaganmisiz? <button onClick={onSwitchToRegister} style={styles.linkButton}>Ro'yxatdan o'tish</button></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '2rem', maxWidth: '400px', width: '100%' },
  title: { textAlign: 'center', color: '#282c34', marginBottom: '1.5rem', fontSize: '1.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' },
  button: { padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' },
  message: { marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1rem', color: '#666' },
  linkButton: { backgroundColor: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' },
};

export default Login;
