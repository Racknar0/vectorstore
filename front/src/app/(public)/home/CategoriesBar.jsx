'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/helpers/mockData';

export default function CategoriesBar() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="categories-bar container" id="categories-section">
      <div className="categories-bar__header">
        <h2 className="categories-bar__title">Explora por categoría</h2>
        <div className="categories-bar__arrows">
          <button
            className={`categories-bar__arrow ${!canScrollLeft ? 'categories-bar__arrow--disabled' : ''}`}
            onClick={() => scroll('left')}
            aria-label="Anterior"
            disabled={!canScrollLeft}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className={`categories-bar__arrow ${!canScrollRight ? 'categories-bar__arrow--disabled' : ''}`}
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            disabled={!canScrollRight}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="categories-bar__track">
        {canScrollLeft && <div className="categories-bar__fade categories-bar__fade--left" />}
        <div className="categories-bar__list" ref={scrollRef}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?category=${cat.slug}`}
              className="categories-bar__item"
            >
              <span className="categories-bar__icon">{cat.icon}</span>
              <span className="categories-bar__name">{cat.name}</span>
              <span className="categories-bar__count">{cat.count}</span>
            </Link>
          ))}
        </div>
        {canScrollRight && <div className="categories-bar__fade categories-bar__fade--right" />}
      </div>
    </section>
  );
}
