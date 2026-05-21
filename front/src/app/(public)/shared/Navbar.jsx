'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useCart from '@/store/useCart';
import './navbar.scss';

export default function Navbar() {
  const pathname = usePathname();
  const { items, openDrawer, isHydrated, hydrate } = useCart();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  const links = [
    { href: '/home', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
  ];

  const cartCount = items.length;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__inner container">
        <Link href="/home" className="navbar__logo">
          <span className="navbar__logo-icon">◆</span>
          <span className="navbar__logo-text">
            Vector<span className="navbar__logo-accent">Store</span>
          </span>
        </Link>

        <div className="navbar__links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__link ${pathname === link.href ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          <Link href="/catalogo" className="navbar__search-btn" aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <button className="navbar__cart-btn" id="cart-button" onClick={openDrawer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="navbar__cart-count" key={cartCount}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
