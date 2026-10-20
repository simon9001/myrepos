import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types'

interface NewsCardProps {
  item: NewsItem
}

const categoryColors: Record<string, string> = {
  Innovation: 'bg-brand-50 text-brand',
  CSR:        'bg-green-light text-green-dark',
  Products:   'bg-orange-light text-orange-dark',
  Expansion:  'bg-purple-50 text-purple-700',
  Tools:      'bg-cyan-50 text-cyan-700',
}

const categoryGradients: Record<string, string> = {
  Innovation: 'from-blue-600 to-blue-800',
  CSR:        'from-green-500 to-green-700',
  Products:   'from-orange-500 to-orange-700',
  Expansion:  'from-purple-500 to-purple-700',
  Tools:      'from-cyan-500 to-cyan-700',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsCard({ item }: NewsCardProps) {
  const catColor = categoryColors[item.category] ?? 'bg-slate-100 text-slate-600'
  const gradient = categoryGradients[item.category] ?? 'from-slate-500 to-slate-700'

  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Thumbnail */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/40 text-6xl font-black select-none">
            {item.category.charAt(0)}
          </span>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${catColor}`}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-slate-400 text-xs mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(item.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {item.readTime}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-3 group-hover:text-brand transition-colors">
          {item.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {item.excerpt}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            to={`/news`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:gap-2.5 transition-all"
          >
            Read more <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}
