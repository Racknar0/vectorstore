'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, resolveImageUrl } from '@/helpers/api';

function LatestCard({ design }) {
  const [imageError, setImageError] = useState(false);

  const pricePen = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined 
    ? design.pricePenDiscount 
    : design.pricePen;

  const imageUrl = imageError || !design.imageUrl 
    ? '/default_placeholder.png' 
    : resolveImageUrl(design.imageUrl);

  return (
    <Link href={`/diseno/${design.slug}`} className="latest__card glass-card">
      <div className="latest__card-img" style={{ position: 'relative', width: '280px', height: '280px', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={design.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImageError(true)}
        />
        {design.isFree && <span className="latest__card-free">GRATIS</span>}
      </div>
      <div className="latest__card-info">
        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{design.category?.name}</span>
        <h4 className="latest__card-name">{design.name}</h4>
        <span className="latest__card-price">
          {design.isFree ? 'Gratis' : `S/ ${pricePen.toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}

export default function LatestCarousel() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatest() {
      try {
        const data = await apiGet('/designs');
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDesigns(sorted);
      } catch (err) {
        console.error('Error loading latest designs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLatest();
  }, []);

  if (loading) {
    return (
      <section className="latest container">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }} />
        </div>
      </section>
    );
  }

  if (designs.length === 0) return null;

  return (
    <section className="latest container" id="latest-section">
      <div className="latest__header">
        <div>
          <h2 className="latest__title">Últimos Diseños</h2>
          <p className="latest__subtitle">Recién agregados a la colección</p>
        </div>
        <Link href="/catalogo" className="btn btn-secondary">
          Ver todos
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="latest__scroll">
        {designs.map((design) => (
          <LatestCard key={design.id} design={design} />
        ))}
      </div>
    </section>
  );
}
