import React, { useState } from 'react';

function ExamViewer({ exam, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleChange = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    exam.questions.forEach(q => {
      const selected = answers[q.id];
      const opt = q.options.find(o => o.id === selected);
      if (opt && opt.is_correct) {
        correct += 1;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>🔙 Orqaga</button>
      <h2>{exam.title}</h2>
      <p>{exam.description}</p>

      {exam.questions.length === 0 ? (
        <p>Bu imtixon uchun savollar qo'shilmagan.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {exam.questions.map(q => (
            <div key={q.id} style={{ marginBottom: '1.5rem' }}>
              <p><strong>{q.text}</strong></p>
              {q.options.map(o => (
                <div key={o.id}>
                  <label>
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={o.id}
                      checked={answers[q.id] === o.id}
                      onChange={() => handleChange(q.id, o.id)}
                    />{' '}
                    {o.text}
                  </label>
                </div>
              ))}
            </div>
          ))}
          {!submitted && <button type="submit">Yuborish</button>}
        </form>
      )}

      {submitted && (
        <div style={{ marginTop: '1rem' }}>
          <p>Natija: {score} / {exam.questions.length}</p>
        </div>
      )}
    </div>
  );
}

export default ExamViewer;
