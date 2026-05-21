'use client';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero" id="hero-section">
      {/* Background Orbs */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      <div className="hero__content container">
        <span className="hero__badge">
          <span className="hero__badge-dot" />
          +1000 modelos premium disponibles
        </span>

        <h1 className="hero__title">
          Encuentra el diseño
          <span className="hero__title-gradient"> perfecto </span>
          para tu equipo
        </h1>

        <p className="hero__subtitle">
          Vectores premium de camisetas deportivas listos para personalizar. 
          Fútbol, motocross, básquet, e-sports y más.
        </p>

        <div className="hero__search">
          <svg className="hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="hero__search-input"
            placeholder="Buscar diseños... ej: Barcelona, Grunge, Racing"
            id="hero-search"
          />
          <Link href="/catalogo" className="hero__search-btn">
            Explorar
          </Link>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-number">1K+</span>
            <span className="hero__stat-label">Diseños</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">AI/PSD</span>
            <span className="hero__stat-label">Formatos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
