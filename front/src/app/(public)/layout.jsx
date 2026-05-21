import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import CartDrawer from './shared/CartDrawer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
