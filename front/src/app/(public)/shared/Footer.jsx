import Link from 'next/link';
import './footer.scss';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">◆</span>
              <span className="footer__logo-text">
                Vector<span className="footer__logo-accent">Store</span>
              </span>
            </div>
            <p className="footer__desc">
              Miles de diseños vectoriales para camisetas deportivas. 
              Encuentra la inspiración perfecta para tu equipo.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__title">Explorar</h4>
            <Link href="/catalogo" className="footer__link">Catálogo</Link>
            <Link href="/catalogo?category=futbol" className="footer__link">Fútbol</Link>
            <Link href="/catalogo?category=motocross" className="footer__link">Motocross</Link>
            <Link href="/catalogo?category=esports" className="footer__link">E-Sports</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__title">Soporte</h4>
            <a href="https://wa.me/51999888777" target="_blank" rel="noopener" className="footer__link">WhatsApp</a>
            <a href="mailto:soporte@vectorstore.com" className="footer__link">Email</a>
            <Link href="#" className="footer__link">Términos</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 VectorStore. Todos los derechos reservados.</span>
          <Link href="/login" className="footer__cms-link">
            ⚙️ Panel CMS
          </Link>
        </div>
      </div>
    </footer>
  );
}
