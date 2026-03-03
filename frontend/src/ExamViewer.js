import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExamViewer.scss';

function ExamViewer({ exam, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState((exam.time_limit || 60) * 60); // Convert minutes to seconds
  const [startTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const handleAutoSubmit = () => {
    handleSubmit(null, true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();

    let correct = 0;
    exam.questions.forEach(q => {
      const selected = answers[q.id];
      const opt = q.options.find(o => o.id === selected);
      if (opt && opt.is_correct) {
        correct += 1;
      }
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = Math.round((correct / exam.questions.length) * 100);
    const passed = finalScore >= 60;

    // Submit test result to backend
    try {
      await axios.post('http://localhost:8000/exams/results', {
        user_id: 1, // Replace with actual user id
        exam_id: exam.id,
        score: finalScore,
        passed: passed,
        time_taken: timeTaken
      });
    } catch (error) {
      console.error('Failed to submit test result:', error);
    }

    setScore(correct);
    setSubmitted(true);
  };

  const timeColor = timeRemaining < 300 ? 'red' : timeRemaining < 600 ? 'orange' : 'green';

  return (
    <div>
      <button onClick={onBack} className="btn btn-secondary exam-viewer-back">🔙 Orqaga</button>
      <h2>{exam.title}</h2>
      <p>{exam.description}</p>

      {!submitted && (
        <div className={`exam-timer timer-${timeColor}`}>
          ⏱️ Qolgan vaqt: <strong>{formatTime(timeRemaining)}</strong>
        </div>
      )}

      {exam.questions.length === 0 ? (
        <p>Bu imtixon uchun savollar qo'shilmagan.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {exam.questions.map((q, idx) => (
            <div key={q.id} className="exam-question">
              <p><strong>{idx + 1}. {q.text}</strong></p>
              {q.options.map(o => (
                <div key={o.id} className="exam-options">
                  <label>
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={o.id}
                      checked={answers[q.id] === o.id}
                      onChange={() => handleChange(q.id, o.id)}
                      disabled={submitted}
                    />{' '}
                    {o.text}
                  </label>
                </div>
              ))}
            </div>
          ))}
          {!submitted && <button type="submit" className="btn btn-primary exam-submit-btn">Yuborish</button>}
        </form>
      )}

      {submitted && (
        <div className="exam-result">
          <h3>📊 Imtixon Natijasi</h3>
          <p><strong>To'g'ri javoblar:</strong> {score} / {exam.questions.length}</p>
          <p><strong>Foiz:</strong> {Math.round((score / exam.questions.length) * 100)}%</p>
          <p><strong>Natija:</strong> {Math.round((score / exam.questions.length) * 100) >= 60 ? '✅ MUVAFFAQIYATLI' : '❌ MUVAFFAQIYATSIZ'}</p>
        </div>
      )}
    </div>
  );
}

export default ExamViewer;
