'use client';
import Link from 'next/link';
import Image from 'next/image';
import { DESIGNS } from '@/helpers/mockData';

export default function LatestCarousel() {
  const latest = [...DESIGNS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        {latest.map((design) => (
          <Link key={design.id} href={`/diseno/${design.slug}`} className="latest__card glass-card">
            <div className="latest__card-img">
              <Image
                src={design.image}
                alt={design.name}
                width={280}
                height={280}
              />
              {design.isFree && <span className="latest__card-free">GRATIS</span>}
            </div>
            <div className="latest__card-info">
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{design.category.name}</span>
              <h4 className="latest__card-name">{design.name}</h4>
              <span className="latest__card-price">
                {design.isFree ? 'Gratis' : `S/ ${design.pricePEN.toFixed(2)}`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
