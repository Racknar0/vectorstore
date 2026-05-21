'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import useCart from '@/store/useCart';
import { apiGet, resolveImageUrl } from '@/helpers/api';
import './detalle.scss';

export default function DetalleDiseno({ params }) {
  const { slug } = use(params);
  const [design, setDesign] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const { addItem, isInCart, removeItem } = useCart();

  useEffect(() => {
    async function loadDesignDetail() {
      try {
        setLoading(true);
        // Cargar el detalle del diseño
        const designData = await apiGet(`/designs/slug/${slug}`);
        setDesign(designData);

        // Cargar todos los diseños para filtrar los relacionados de la misma categoría
        const allDesigns = await apiGet('/designs');
        const filteredRelated = allDesigns
          .filter((d) => d.id !== designData.id && d.category?.id === designData.category?.id)
          .slice(0, 4);
        setRelated(filteredRelated);
      } catch (err) {
        console.error(err);
        setError('No se pudo encontrar el diseño seleccionado o hubo un problema al cargar los datos.');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadDesignDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="detalle container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando detalles del vector...</p>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="detalle container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', maxWidth: '500px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⚠️</span>
          <h2 style={{ marginBottom: '10px' }}>Diseño no encontrado</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>{error || 'El diseño buscado no existe.'}</p>
          <Link href="/catalogo" className="btn btn-primary">Volver al Catálogo</Link>
        </div>
      </div>
    );
  }

  const inCart = isInCart(design.id);
  // Combinar imagen principal y galería sin duplicados
  const imageList = [];
  if (design.imageUrl) {
    imageList.push(design.imageUrl);
  }
  if (design.gallery && Array.isArray(design.gallery)) {
    design.gallery.forEach((img) => {
      if (img && !imageList.includes(img)) {
        imageList.push(img);
      }
    });
  }

  const allImages = imageList.length > 0 
    ? imageList.map(img => resolveImageUrl(img)) 
    : ['/default_placeholder.png'];

  const currentPricePen = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined 
    ? design.pricePenDiscount 
    : design.pricePen;
  const originalPricePen = design.pricePen;
  const hasDiscountPen = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined;

  const currentPriceUsd = design.priceUsdDiscount !== null && design.priceUsdDiscount !== undefined 
    ? design.priceUsdDiscount 
    : design.priceUsd;

  return (
    <div className="detalle container" id="detalle-page">
      {/* Breadcrumb */}
      <nav className="detalle__breadcrumb">
        <Link href="/home">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo">Catálogo</Link>
        <span>/</span>
        <span className="detalle__breadcrumb-current">{design.name}</span>
      </nav>

      <div className="detalle__main">
        {/* Gallery */}
        <div className="detalle__gallery">
          <div className="detalle__gallery-main" style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '12px' }}>
            <img
              src={imageErrors[allImages[selectedImage]] || !allImages[selectedImage] ? '/default_placeholder.png' : allImages[selectedImage]}
              alt={design.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="detalle__gallery-image"
              onError={() => {
                setImageErrors(prev => ({ ...prev, [allImages[selectedImage]]: true }));
              }}
            />
            {design.isFree && <span className="detalle__gallery-badge-free">GRATIS</span>}
            {hasDiscountPen && !design.isFree && <span className="detalle__gallery-badge-sale">OFERTA</span>}
          </div>
          {allImages.length > 1 && (
            <div className="detalle__gallery-thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`detalle__gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                  style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '8px', padding: 0 }}
                >
                  <img
                    src={imageErrors[img] ? '/default_placeholder.png' : img}
                    alt={`Vista ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [img]: true }));
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detalle__info">
          <div className="detalle__info-top" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-purple">{design.category?.name}</span>
            {design.tags && design.tags.map(t => (
              <span key={t.id} className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '3px 8px', opacity: 0.85, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(255,255,255,0.05)' }}>
                # {t.name}
              </span>
            ))}
            <span className="detalle__downloads" style={{ marginLeft: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              {design.downloadCount} descargas
            </span>
          </div>

          <h1 className="detalle__name">{design.name}</h1>

          <div className="detalle__price-block">
            {design.isFree ? (
              <span className="detalle__price detalle__price--free">Gratis</span>
            ) : (
              <>
                <span className="detalle__price">S/ {currentPricePen.toFixed(2)}</span>
                {currentPriceUsd > 0 && (
                  <span className="detalle__price-usd">≈ $ {currentPriceUsd.toFixed(2)} USD</span>
                )}
                {hasDiscountPen && (
                  <span className="detalle__price-old">S/ {originalPricePen.toFixed(2)}</span>
                )}
              </>
            )}
          </div>

          <p className="detalle__description">{design.description}</p>

          <div className="detalle__meta">
            <div className="detalle__meta-item">
              <span className="detalle__meta-label">Formato</span>
              <span className="detalle__meta-value">{design.fileFormat}</span>
            </div>
            <div className="detalle__meta-item">
              <span className="detalle__meta-label">Categoría</span>
              <span className="detalle__meta-value">{design.category?.name}</span>
            </div>
            <div className="detalle__meta-item">
              <span className="detalle__meta-label">Publicado</span>
              <span className="detalle__meta-value">{new Date(design.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="detalle__actions">
            {inCart ? (
              <button
                className="btn btn-lg detalle__add-cart detalle__add-cart--in"
                id="add-to-cart"
                onClick={() => removeItem(design.id)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                En el carrito — Quitar
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg detalle__add-cart"
                id="add-to-cart"
                onClick={() => addItem({
                  id: design.id,
                  name: design.name,
                  slug: design.slug,
                  image: design.imageUrl,
                  pricePEN: currentPricePen,
                  priceUSD: currentPriceUsd,
                  fileFormat: design.fileFormat,
                  isFree: design.isFree
                })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Agregar al carrito
              </button>
            )}
            <Link href="/checkout" className="btn btn-outline btn-lg" onClick={() => {
              if (!inCart) {
                addItem({
                  id: design.id,
                  name: design.name,
                  slug: design.slug,
                  image: design.imageUrl,
                  pricePEN: currentPricePen,
                  priceUSD: currentPriceUsd,
                  fileFormat: design.fileFormat,
                  isFree: design.isFree
                });
              }
            }}>
              Comprar ahora
            </Link>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="detalle__related" id="related-designs">
        <h2 className="detalle__related-title">Diseños Relacionados</h2>
        <div className="detalle__related-grid">
          {related.map((d) => {
            const relPrice = d.pricePenDiscount !== null && d.pricePenDiscount !== undefined ? d.pricePenDiscount : d.pricePen;
            return (
              <Link key={d.id} href={`/diseno/${d.slug}`} className="design-card glass-card">
                <div className="design-card__image-wrapper" style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img 
                    src={!d.imageUrl || imageErrors[resolveImageUrl(d.imageUrl)] ? '/default_placeholder.png' : resolveImageUrl(d.imageUrl)} 
                    alt={d.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    className="design-card__image" 
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [resolveImageUrl(d.imageUrl)]: true }));
                    }}
                  />
                  <div className="design-card__overlay">
                    <span className="design-card__view-btn">Ver diseño</span>
                  </div>
                </div>
                <div className="design-card__info">
                  <span className="design-card__category badge badge-purple">{d.category?.name}</span>
                  <h3 className="design-card__name">{d.name}</h3>
                  <div className="design-card__bottom">
                    <div className="design-card__price">
                      {d.isFree ? (
                        <span className="design-card__price-free">Gratis</span>
                      ) : (
                        <span className="design-card__price-current">S/ {relPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className="design-card__format">{d.fileFormat}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
