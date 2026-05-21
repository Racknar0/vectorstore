'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useCart from '@/store/useCart';
import './cart-drawer.scss';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, getTotal, hydrate, isHydrated } = useCart();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer__backdrop ${isDrawerOpen ? 'cart-drawer__backdrop--open' : ''}`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${isDrawerOpen ? 'cart-drawer--open' : ''}`} id="cart-drawer">
        {/* Header */}
        <div className="cart-drawer__header">
          <h3 className="cart-drawer__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Carrito
            <span className="cart-drawer__count">{items.length}</span>
          </h3>
          <button className="cart-drawer__close" onClick={closeDrawer} aria-label="Cerrar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p>Tu carrito está vacío</p>
              <button className="btn btn-secondary btn-sm" onClick={closeDrawer}>Seguir explorando</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-drawer__item">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={72}
                  height={72}
                  className="cart-drawer__item-img"
                />
                <div className="cart-drawer__item-info">
                  <Link href={`/diseno/${item.slug}`} className="cart-drawer__item-name" onClick={closeDrawer}>
                    {item.name}
                  </Link>
                  <span className="cart-drawer__item-format">{item.fileFormat}</span>
                  <span className="cart-drawer__item-price">
                    {item.isFree ? 'Gratis' : `S/ ${item.pricePEN.toFixed(2)}`}
                  </span>
                </div>
                <button
                  className="cart-drawer__item-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Quitar ${item.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span className="cart-drawer__total-value">S/ {total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-lg cart-drawer__checkout" onClick={closeDrawer}>
              Ir al checkout
            </Link>
            <button className="cart-drawer__clear" onClick={() => useCart.getState().clearCart()}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
