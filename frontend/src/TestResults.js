import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestResults.scss';

function TestResults({ examId, onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTakers: 0,
    passed: 0,
    failed: 0,
    averageScore: 0,
    averageTime: 0,
  });

  useEffect(() => {
    fetchTestResults();
  }, [examId]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`http://localhost:8000/exams/${examId}/results`);
      const data = resp.data;
      setResults(data);

      // Calculate statistics
      if (data.length > 0) {
        const passed = data.filter(r => r.passed).length;
        const failed = data.filter(r => !r.passed).length;
        const avgScore = Math.round(data.reduce((sum, r) => sum + (r.score || 0), 0) / data.length);
        const avgTime = Math.round(data.reduce((sum, r) => sum + (r.time_taken || 0), 0) / data.length);

        setStats({
          totalTakers: data.length,
          passed,
          failed,
          averageScore: avgScore,
          averageTime: avgTime,
        });
      }
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <p className="loading">Yuklanmoqda...</p>;
  }

  return (
    <div className="test-results">
      <button onClick={onBack} className="btn btn-secondary mb-3">
        🔙 Orqaga
      </button>

      <h2>📊 Imtixon Natijalari</h2>

      {results.length === 0 ? (
        <p className="no-results">Hech kim bu imtixonni yechmagani yo'q.</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Jami Olinganlar</h4>
              <p className="stat-value">{stats.totalTakers}</p>
            </div>
            <div className="stat-card success">
              <h4>Muvaffaqiyatli ✅</h4>
              <p className="stat-value">{stats.passed}</p>
            </div>
            <div className="stat-card danger">
              <h4>Muvaffaqiyatsiz ❌</h4>
              <p className="stat-value">{stats.failed}</p>
            </div>
            <div className="stat-card info">
              <h4>O'rtacha Ball</h4>
              <p className="stat-value">{stats.averageScore}%</p>
            </div>
            <div className="stat-card">
              <h4>O'rtacha Vaqt</h4>
              <p className="stat-value">{formatTime(stats.averageTime)}</p>
            </div>
          </div>

          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Foydalanuvchi ID</th>
                  <th>Ball (%)</th>
                  <th>Natija</th>
                  <th>Vaqt</th>
                  <th>Boshlanish Vaqti</th>
                  <th>Yakunlanish Vaqti</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={result.id} className={result.passed ? 'passed' : 'failed'}>
                    <td>{idx + 1}</td>
                    <td>User {result.user_id}</td>
                    <td className="score-cell">
                      <span className={`score-badge ${result.passed ? 'success' : 'danger'}`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>
                      {result.passed ? (
                        <span className="badge-passed">✅ Muvaffaqiyatli</span>
                      ) : (
                        <span className="badge-failed">❌ Muvaffaqiyatsiz</span>
                      )}
                    </td>
                    <td>{formatTime(result.time_taken)}</td>
                    <td className="date-cell">{formatDateTime(result.started_at)}</td>
                    <td className="date-cell">
                      {result.completed_at
                        ? formatDateTime(result.completed_at)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default TestResults;
