import { ShoppingCart, Tag, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import Badge from './Badge'

interface ProductCardProps {
  product: Product
  categoryColor?: string
}

const categoryGradients: Record<string, string> = {
  'water-pumps':       'from-blue-600 to-blue-800',
  'solar':             'from-amber-500 to-orange-600',
  'generators':        'from-red-500 to-red-700',
  'swimming-pools':    'from-cyan-500 to-cyan-700',
  'water-treatment':   'from-purple-500 to-purple-700',
  'irrigation':        'from-green-500 to-green-700',
  'borehole-solutions':'from-sky-500 to-sky-700',
  'general-machinery': 'from-orange-500 to-orange-700',
  'controllers':       'from-indigo-500 to-indigo-700',
}

export default function ProductCard({ product }: ProductCardProps) {
  const gradient = categoryGradients[product.category] ?? 'from-slate-500 to-slate-700'

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image / Placeholder */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white/80 px-4">
            <ShoppingCart size={40} className="mx-auto mb-2 opacity-60" />
            <span className="text-xs font-medium opacity-70">{product.brand}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="flex items-center gap-1 bg-green text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Sparkles size={10} /> New
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-1 bg-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <TrendingUp size={10} /> Best Seller
            </span>
          )}
        </div>

        {/* Brand pill */}
        <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
          {product.brand}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} color="gray">
              <Tag size={9} className="mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {product.shortDesc}
        </p>

        {/* Specs preview */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4 bg-surface rounded-lg p-3">
            {Object.entries(product.specs)
              .slice(0, 2)
              .map(([key, val]) => (
                <div key={key}>
                  <span className="text-slate-400 text-xs block">{key}</span>
                  <span className="text-slate-700 text-xs font-semibold">{val}</span>
                </div>
              ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          {product.price ? (
            <span className="text-brand font-extrabold text-base">{product.price}</span>
          ) : (
            <span className="text-slate-400 text-sm italic">Contact for pricing</span>
          )}
          <Link
            to={`/products/${product.category}`}
            className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  )
}
