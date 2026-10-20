import { Link } from 'react-router-dom'
import {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu, ArrowRight,
} from 'lucide-react'
import { categories } from '../../data/mockData'
import SectionHeader from '../ui/SectionHeader'

const iconMap: Record<string, React.ElementType> = {
  Droplets, Sun, Zap, Waves, FlaskConical, Sprout,
  Gauge, Wrench, Cpu,
}

export default function ProductCategories() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Products & Solutions"
          title="Everything You Need for Water & Energy"
          description="From a single home pump to a full industrial water treatment plant — we have the right solution."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Droplets
            return (
              <Link
                key={cat.id}
                to={`/products/${cat.slug}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 hover:border-transparent transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Colored accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: cat.color }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}18` }}
                >
                  <Icon size={24} style={{ color: cat.color }} />
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1.5 group-hover:text-brand transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Subcategories */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cat.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub.slug}
                      className="text-xs bg-surface text-slate-500 px-2 py-0.5 rounded-full border border-slate-100"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="text-xs text-slate-400 px-2 py-0.5">
                      +{cat.subcategories.length - 3} more
                    </span>
                  )}
                </div>

                <div
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                  style={{ color: cat.color }}
                >
                  Browse {cat.name} <ArrowRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            View All Products & Solutions <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
