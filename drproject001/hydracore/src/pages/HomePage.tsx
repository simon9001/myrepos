import HeroBanner from '../components/home/HeroBanner'
import StatsSection from '../components/home/StatsSection'
import ProductCategories from '../components/home/ProductCategories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ImprovingLives from '../components/home/ImprovingLives'
import TestimonialsSection from '../components/home/TestimonialsSection'
import NewsSection from '../components/home/NewsSection'
import CTABanner from '../components/home/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <StatsSection />
      <ProductCategories />
      <FeaturedProducts />
      <ImprovingLives />
      <TestimonialsSection />
      <NewsSection />
      <CTABanner />
    </>
  )
}
