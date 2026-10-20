import { Link } from 'react-router-dom'
import {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu, ArrowRight, Search,
} from 'lucide-react'
import { categories, products } from '../data/mockData'
import SectionHeader from '../components/ui/SectionHeader'
import ProductCard from '../components/ui/ProductCard'

const iconMap: Record<string, React.ElementType> = {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu,
}

export default function ProductsPage() {
  const featured = products.filter((p) => p.featured).slice(0, 4)

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-gradient-to-r from-brand-dark to-brand py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white">
            <div className="text-sm font-bold uppercase tracking-widest text-brand-100 mb-3">Products & Solutions</div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Our Complete Product Range</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              Over 5,000 products across 9 categories — from water pumps to smart IoT controllers.
              Explore world-class brands and our own Dayliff range.
            </p>

            {/* Search bar */}
            <div className="relative max-w-md mx-auto mt-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories…"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Browse by Category"
            title="9 Product Categories"
            description="Click a category to explore the full range of products and solutions."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Droplets
              return (
                <Link
                  key={cat.id}
                  to={`/products/${cat.slug}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 hover:border-transparent transition-all duration-300 hover:-translate-y-1 flex gap-4 items-start"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}18` }}
                  >
                    <Icon size={22} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">
                      {cat.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.slug}
                          className="text-xs bg-surface text-slate-500 px-2 py-0.5 rounded-full border border-slate-100"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-brand transition-colors shrink-0 mt-1"
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Staff Picks"
            title="Featured Products"
            description="Our team's top recommendations across all categories."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-14 bg-surface border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
            Authorised Distributor for World-Class Brands
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Dayliff', 'Grundfos', 'Pedrollo', 'Davey', 'DAB', 'Victron', 'Hayward', 'Praher', 'Flowserve'].map((brand) => (
              <div
                key={brand}
                className="px-6 py-3 bg-white rounded-xl border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:border-brand hover:text-brand transition-all"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
