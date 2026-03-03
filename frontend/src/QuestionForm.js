import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuestionForm({ examId, questions, setQuestions, editingQuestion, setEditingQuestion, refreshQuestions }) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState([{ text: '', is_correct: false }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setText(editingQuestion.text || '');
      setOptions(
        (editingQuestion.options || []).map(o => ({ text: o.text, is_correct: o.is_correct }))
      );
    }
  }, [editingQuestion]);

  const handleOptionChange = (idx, field, value) => {
    const newOpts = [...options];
    newOpts[idx][field] = value;
    setOptions(newOpts);
  };

  const addOption = () => setOptions([...options, { text: '', is_correct: false }]);
  const removeOption = idx => setOptions(options.filter((_, i) => i !== idx));

  const clearForm = () => {
    setText('');
    setOptions([{ text: '', is_correct: false }]);
    setEditingQuestion(null);
    setMessage('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!text.trim()) {
      setMessage('Savol matni bo\'sh bo\'lishi mumkin emas');
      return;
    }
    if (options.length === 0) {
      setMessage('Kamida bitta variant kerak');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const payload = { text, options };
      if (editingQuestion) {
        await axios.put(`http://localhost:8000/questions/${editingQuestion.id}`, payload);
        setMessage('Savol yangilandi');
      } else {
        await axios.post(`http://localhost:8000/exams/${examId}/questions`, payload);
        setMessage('Savol qo\'shildi');
      }
      clearForm();
      refreshQuestions();
    } catch (err) {
      setMessage('Xatolik: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = q => {
    setEditingQuestion(q);
  };

  const handleDelete = async q => {
    if (!window.confirm('Savolni oʻchirish kerakmi?')) return;
    try {
      await axios.delete(`http://localhost:8000/questions/${q.id}`);
      setMessage('Savol oʻchirildi');
      refreshQuestions();
    } catch (err) {
      setMessage('Xatolik: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Savol matni</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            style={styles.textarea}
          />
        </div>
        <div>
          <label>Variantlar</label>
          {options.map((opt, idx) => (
            <div key={idx} style={styles.optionRow}>
              <input
                type="text"
                value={opt.text}
                onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                placeholder="Variant matni"
                style={styles.optionInput}
              />
              <label>
                <input
                  type="checkbox"
                  checked={opt.is_correct}
                  onChange={e => handleOptionChange(idx, 'is_correct', e.target.checked)}
                />
                {' '}To'g'ri
              </label>
              {options.length > 1 && (
                <button type="button" onClick={() => removeOption(idx)} style={styles.smallButton}>❌</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} style={styles.smallButton}>➕ Variant qoʻshish</button>
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Jarayon...' : editingQuestion ? 'Savolni yangilash' : 'Savol qoʻshish'}
        </button>
        {editingQuestion && <button type="button" onClick={clearForm} style={styles.cancelButton}>Bekor qilish</button>}
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <div style={{ marginTop: '1rem' }}>
        <h4>Mavjud savollar</h4>
        {questions.length === 0 ? <p>Hozircha savollar yo'q.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {questions.map(q => (
              <li key={q.id} style={styles.questionItem}>
                <div>{q.text}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(q)} style={{ ...styles.button, backgroundColor: '#ffc107' }}>Tahrirlash</button>
                  <button onClick={() => handleDelete(q)} style={{ ...styles.button, backgroundColor: '#dc3545' }}>O'chirish</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  textarea: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' },
  optionRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' },
  optionInput: { flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' },
  button: { padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  smallButton: { padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' },
  cancelButton: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' },
  message: { marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#e8f4f8', borderLeft: '4px solid #007bff', borderRadius: '4px' },
  questionItem: { padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default QuestionForm;
