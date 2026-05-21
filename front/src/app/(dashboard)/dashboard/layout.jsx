'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './dashboard.scss';

const NAV_ITEMS = [
  {
    label: 'Dashboard', href: '/dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
  },
  {
    label: 'Diseños', href: '/dashboard/disenos',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></svg>,
  },
  {
    label: 'Categorías', href: '/dashboard/categorias',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>,
  },
  {
    label: 'Pedidos', href: '/dashboard/pedidos', badge: 2,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  },
  {
    label: 'Métodos de Pago', href: '/dashboard/metodos-pago',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>,
  },
  {
    label: 'Configuración', href: '/dashboard/configuracion',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar" id="dashboard-sidebar">
        <div className="dash-sidebar__logo">
          <Link href="/home">
            <span className="dash-sidebar__logo-icon">◆</span>
            <span className="dash-sidebar__logo-text">
              Vector<span className="dash-sidebar__logo-accent">Store</span>
            </span>
          </Link>
        </div>

        <nav className="dash-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-sidebar__item ${isActive ? 'dash-sidebar__item--active' : ''}`}
              >
                <span className="dash-sidebar__item-icon">{item.icon}</span>
                <span className="dash-sidebar__item-label">{item.label}</span>
                {item.badge && <span className="dash-sidebar__item-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="dash-sidebar__footer">
          <Link href="/home" className="dash-sidebar__item">
            <span className="dash-sidebar__item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            </span>
            <span className="dash-sidebar__item-label">Ir a la tienda</span>
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <h2 className="dash-topbar__title">
            {NAV_ITEMS.find((i) => pathname === i.href || (i.href !== '/dashboard' && pathname.startsWith(i.href)))?.label || 'Dashboard'}
          </h2>
          <div className="dash-topbar__user">
            <span className="dash-topbar__avatar">AD</span>
            <span className="dash-topbar__name">Admin</span>
          </div>
        </header>
        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  );
}
