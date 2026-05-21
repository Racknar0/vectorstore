'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, resolveImageUrl } from '@/helpers/api';
import useCart from '@/store/useCart';

function DesignCard({ design }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(design.id);
  const [imageError, setImageError] = useState(false);

  const pricePen = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined 
    ? design.pricePenDiscount 
    : design.pricePen;
  const originalPricePen = design.pricePen;
  const hasDiscountPen = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined;

  const priceUsd = design.priceUsdDiscount !== null && design.priceUsdDiscount !== undefined 
    ? design.priceUsdDiscount 
    : design.priceUsd;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem({
        id: design.id,
        name: design.name,
        slug: design.slug,
        image: design.imageUrl,
        pricePEN: pricePen,
        priceUSD: priceUsd,
        fileFormat: design.fileFormat,
        isFree: design.isFree
      });
    }
  };

  const imageUrl = imageError || !design.imageUrl 
    ? '/default_placeholder.png' 
    : resolveImageUrl(design.imageUrl);

  return (
    <Link href={`/diseno/${design.slug}`} className="design-card glass-card" id={`design-card-${design.id}`}>
      <div className="design-card__image-wrapper" style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={design.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="design-card__image"
          onError={() => setImageError(true)}
        />
        {design.isFree && (
          <span className="design-card__free-badge">GRATIS</span>
        )}
        {hasDiscountPen && !design.isFree && (
          <span className="design-card__sale-badge">OFERTA</span>
        )}
        <div className="design-card__overlay">
          <button
            className={`design-card__add-btn ${inCart ? 'design-card__add-btn--in-cart' : ''}`}
            onClick={handleAddToCart}
          >
            {inCart ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                En el carrito
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>

      <div className="design-card__info">
        <span className="design-card__category badge badge-purple">{design.category?.name}</span>
        <h3 className="design-card__name">{design.name}</h3>
        <div className="design-card__bottom">
          <div className="design-card__price">
            {design.isFree ? (
              <span className="design-card__price-free">Gratis</span>
            ) : (
              <>
                <span className="design-card__price-current">S/ {pricePen.toFixed(2)}</span>
                {hasDiscountPen && (
                  <span className="design-card__price-old">S/ {originalPricePen.toFixed(2)}</span>
                )}
              </>
            )}
          </div>
          <span className="design-card__format">{design.fileFormat}</span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedGrid() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await apiGet('/designs');
        // Sort by download count or fallback to order of creation
        const sorted = [...data].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 4);
        setDesigns(sorted);
      } catch (err) {
        console.error('Error loading featured designs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  if (loading) {
    return (
      <section className="featured container">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }} />
        </div>
      </section>
    );
  }

  if (designs.length === 0) return null;

  return (
    <section className="featured container" id="featured-section">
      <div className="featured__header">
        <div>
          <h2 className="featured__title">Diseños Destacados</h2>
          <p className="featured__subtitle">Los más populares y mejor valorados por nuestra comunidad</p>
        </div>
        <Link href="/catalogo" className="btn btn-secondary">
          Ver todos
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="featured__grid">
        {designs.map((design, i) => (
          <div key={design.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <DesignCard design={design} />
          </div>
        ))}
      </div>
    </section>
  );
}

export { DesignCard };
