'use client';
import Link from 'next/link';
import Image from 'next/image';
import { DESIGNS } from '@/helpers/mockData';
import useCart from '@/store/useCart';

function DesignCard({ design }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(design.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) addItem(design);
  };

  return (
    <Link href={`/diseno/${design.slug}`} className="design-card glass-card" id={`design-card-${design.id}`}>
      <div className="design-card__image-wrapper">
        <Image
          src={design.image}
          alt={design.name}
          width={400}
          height={400}
          className="design-card__image"
        />
        {design.isFree && (
          <span className="design-card__free-badge">GRATIS</span>
        )}
        {design.compareAtPrice && (
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
        <span className="design-card__category badge badge-purple">{design.category.name}</span>
        <h3 className="design-card__name">{design.name}</h3>
        <div className="design-card__bottom">
          <div className="design-card__price">
            {design.isFree ? (
              <span className="design-card__price-free">Gratis</span>
            ) : (
              <>
                <span className="design-card__price-current">S/ {design.pricePEN.toFixed(2)}</span>
                {design.compareAtPrice && (
                  <span className="design-card__price-old">S/ {design.compareAtPrice.toFixed(2)}</span>
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
  const featured = DESIGNS.filter((d) => d.isFeatured);

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
        {featured.map((design, i) => (
          <div key={design.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <DesignCard design={design} />
          </div>
        ))}
      </div>
    </section>
  );
}

export { DesignCard };
