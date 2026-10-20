import { useParams, Link } from 'react-router-dom'
import {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu, ArrowRight, Phone, ChevronRight,
} from 'lucide-react'
import { categories, products } from '../data/mockData'
import ProductCard from '../components/ui/ProductCard'
import CTABanner from '../components/home/CTABanner'

const iconMap: Record<string, React.ElementType> = {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu,
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Category not found</h2>
          <Link to="/products" className="text-brand hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const Icon = iconMap[category.icon] ?? Droplets
  const catProducts = products.filter((p) => p.category === category.slug)

  return (
    <div>
      {/* Hero */}
      <div
        className="py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${category.color}CC 0%, ${category.color} 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight size={14} />
            <span className="text-white font-semibold">{category.name}</span>
          </div>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Icon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{category.name}</h1>
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                {category.longDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">Subcategories</h3>
              <ul className="space-y-1">
                {category.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-brand hover:bg-brand-50 transition-colors text-left font-medium">
                      {sub.name}
                      <ArrowRight size={12} className="text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3">Need Help?</h3>
                <p className="text-slate-500 text-xs mb-4">
                  Our technical team can help you choose the right solution.
                </p>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 bg-brand text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors w-full"
                >
                  <Phone size={14} /> Talk to an Expert
                </Link>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg">
                {catProducts.length} Product{catProducts.length !== 1 ? 's' : ''} Found
              </h2>
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand bg-white">
                <option>Sort by: Featured</option>
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
                <option>Sort by: Newest</option>
              </select>
            </div>

            {catProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface rounded-2xl border border-slate-100">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${category.color}18` }}
                >
                  <Icon size={28} style={{ color: category.color }} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">No products listed yet</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Contact us for the full product catalogue in this category.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors"
                >
                  <Phone size={14} /> Request Catalogue
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <CTABanner />
    </div>
  )
}
