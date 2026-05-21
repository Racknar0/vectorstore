import HeroSection from './HeroSection';
import CategoriesBar from './CategoriesBar';
import FeaturedGrid from './FeaturedGrid';
import LatestCarousel from './LatestCarousel';
import CtaBanner from './CtaBanner';
import './home.scss';

export const metadata = {
  title: 'Vector Store — Diseños Deportivos Premium',
  description: 'Miles de vectores para camisetas deportivas. Fútbol, motocross, básquet y más.',
};

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroSection />
      <CategoriesBar />
      <FeaturedGrid />
      <LatestCarousel />
      <CtaBanner />
    </div>
  );
}
