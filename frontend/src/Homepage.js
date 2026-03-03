import React from 'react';
import './Homepage.scss';

function Homepage({ onGetStarted }) {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">📚 WebLearning</h1>
          <p className="hero-subtitle">Zamonaviy o'quvchi platformasi</p>
          <p className="hero-description">
            Kurslarni o'zlashtiring, testlarni yechish orqali bilimingizni sinab ko'ring
          </p>
          <button className="hero-button" onClick={onGetStarted}>
            Boshlash 🚀
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-icon">📖</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Afzaliklari</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Sifatli Kurslar</h3>
            <p>Faqliy o'qituvchilar tomonidan tuzilgan video darslar va materiallar</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Vaqtiga Jami Test</h3>
            <p>O'zingizning bilimingizni tezda sinab ko'ring belgilangan vaqt ichida</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Natija Ko'ringiz</h3>
            <p>Testni yechganingizdan so'ng tafsilotli natija ko'ring va tahlil qiling</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Video Darslar</h3>
            <p>YouTube yoki yuklab olingan videolardan foydalanib yuqori tezlikda o'rganing</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>O'quvni boshlash uchun tayyor?</h2>
        <p>Ko'p sonli kurs va testlar sizni kutmoqda</p>
        <button className="cta-button" onClick={onGetStarted}>
          Ro'yxatdan o'tish yoki kirish
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 WebLearning. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}

export default Homepage;
