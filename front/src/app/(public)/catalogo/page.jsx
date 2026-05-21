'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TAGS } from '@/helpers/mockData';
import { apiGet, resolveImageUrl } from '@/helpers/api';
import './catalogo.scss';

function DesignCard({ design }) {
  const [imageError, setImageError] = useState(false);
  const price = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined 
    ? design.pricePenDiscount 
    : design.pricePen;
  const hasDiscount = design.pricePenDiscount !== null && design.pricePenDiscount !== undefined;

  const imageUrl = imageError || !design.imageUrl 
    ? '/default_placeholder.png' 
    : resolveImageUrl(design.imageUrl);

  return (
    <Link href={`/diseno/${design.slug}`} className="design-card glass-card">
      <div className="design-card__image-wrapper" style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
        <img 
          src={imageUrl} 
          alt={design.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          className="design-card__image" 
          onError={() => setImageError(true)}
        />
        {design.isFree && <span className="design-card__free-badge">GRATIS</span>}
        {hasDiscount && !design.isFree && <span className="design-card__sale-badge">OFERTA</span>}
        <div className="design-card__overlay">
          <span className="design-card__view-btn">Ver diseño</span>
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
                <span className="design-card__price-current">S/ {price.toFixed(2)}</span>
                {hasDiscount && <span className="design-card__price-old">S/ {design.pricePen.toFixed(2)}</span>}
              </>
            )}
          </div>
          <span className="design-card__format">{design.fileFormat}</span>
        </div>
      </div>
    </Link>
  );
}

export default function CatalogoPage() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos del backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [designsData, categoriesData] = await Promise.all([
          apiGet('/designs'),
          apiGet('/categories'),
        ]);
        setDesigns(designsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con el servidor para cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  let filtered = [...designs];
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((d) => d.category?.slug === selectedCategory);
  }
  if (priceRange === 'free') {
    filtered = filtered.filter((d) => d.isFree);
  } else if (priceRange === '0-15') {
    filtered = filtered.filter((d) => {
      const price = d.pricePenDiscount !== null && d.pricePenDiscount !== undefined ? d.pricePenDiscount : d.pricePen;
      return !d.isFree && price <= 15;
    });
  } else if (priceRange === '15-30') {
    filtered = filtered.filter((d) => {
      const price = d.pricePenDiscount !== null && d.pricePenDiscount !== undefined ? d.pricePenDiscount : d.pricePen;
      return !d.isFree && price > 15 && price <= 30;
    });
  } else if (priceRange === '30+') {
    filtered = filtered.filter((d) => {
      const price = d.pricePenDiscount !== null && d.pricePenDiscount !== undefined ? d.pricePenDiscount : d.pricePen;
      return !d.isFree && price > 30;
    });
  }

  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'price-asc') {
    filtered.sort((a, b) => {
      const priceA = a.pricePenDiscount !== null && a.pricePenDiscount !== undefined ? a.pricePenDiscount : a.pricePen;
      const priceB = b.pricePenDiscount !== null && b.pricePenDiscount !== undefined ? b.pricePenDiscount : b.pricePen;
      return priceA - priceB;
    });
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => {
      const priceA = a.pricePenDiscount !== null && a.pricePenDiscount !== undefined ? a.pricePenDiscount : a.pricePen;
      const priceB = b.pricePenDiscount !== null && b.pricePenDiscount !== undefined ? b.pricePenDiscount : b.pricePen;
      return priceB - priceA;
    });
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  if (loading) {
    return (
      <div className="catalogo container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando catálogo de vectores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalogo container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', maxWidth: '500px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⚠️</span>
          <h2 style={{ marginBottom: '10px' }}>Error de conexión</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo container" id="catalogo-page">
      <div className="catalogo__header">
        <div>
          <h1 className="catalogo__title">Catálogo de Diseños</h1>
          <p className="catalogo__subtitle">{filtered.length} diseños encontrados</p>
        </div>
        <button className="btn btn-secondary catalogo__filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" />
            <line x1="17" x2="23" y1="16" y2="16" />
          </svg>
          Filtros
        </button>
      </div>

      <div className="catalogo__body">
        <aside className={`catalogo__sidebar ${showFilters ? 'catalogo__sidebar--open' : ''}`}>
          <div className="catalogo__filter-group">
            <h3 className="catalogo__filter-title">Categoría</h3>
            <button className={`catalogo__filter-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`catalogo__filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.icon} {cat.name}
                <span className="catalogo__filter-count">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="catalogo__filter-group">
            <h3 className="catalogo__filter-title">Precio</h3>
            {[
              { value: 'all', label: 'Todos' },
              { value: 'free', label: 'Gratis' },
              { value: '0-15', label: 'S/ 0 - S/ 15' },
              { value: '15-30', label: 'S/ 15 - S/ 30' },
              { value: '30+', label: 'S/ 30+' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`catalogo__filter-btn ${priceRange === opt.value ? 'active' : ''}`}
                onClick={() => setPriceRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="catalogo__filter-group">
            <h3 className="catalogo__filter-title">Ordenar por</h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="catalogo__sort-select">
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>

          <div className="catalogo__filter-group">
            <h3 className="catalogo__filter-title">Tags populares</h3>
            <div className="catalogo__tags">
              {TAGS.map((tag) => (
                <span key={tag.id} className="catalogo__tag">{tag.name}</span>
              ))}
            </div>
          </div>
        </aside>

        <div className="catalogo__grid">
          {filtered.length > 0 ? (
            filtered.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))
          ) : (
            <div className="catalogo__empty">
              <p>No se encontraron diseños con los filtros seleccionados.</p>
              <button className="btn btn-primary" onClick={() => { setSelectedCategory('all'); setPriceRange('all'); }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
