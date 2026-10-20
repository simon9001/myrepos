import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../../data/mockData'
import ProductCard from '../ui/ProductCard'
import SectionHeader from '../ui/SectionHeader'

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.featured).slice(0, 8)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <SectionHeader
            eyebrow="Featured Products"
            title="Top Picks from Our Range"
            description="Bestsellers, new arrivals, and staff-recommended solutions across all categories."
          />
          <Link
            to="/products"
            className="hidden md:inline-flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all shrink-0"
          >
            View all products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all"
          >
            View all products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
