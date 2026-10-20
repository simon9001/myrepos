import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { news } from '../data/mockData'
import NewsCard from '../components/ui/NewsCard'
import SectionHeader from '../components/ui/SectionHeader'
import CTABanner from '../components/home/CTABanner'

const allCategories = ['All', ...Array.from(new Set(news.map(n => n.category)))]

export default function NewsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-dark to-brand py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-100 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span>News & Media</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">News & Media</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            The latest updates from Davis & Shirtliff — product launches, expansions, CSR stories, and more.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                cat === 'All'
                  ? 'bg-brand text-white'
                  : 'bg-surface text-slate-600 hover:text-brand hover:bg-brand-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow={`${news.length} Articles`}
            title="Latest Stories"
          />

          {/* Featured — first article large */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center relative">
                <span className="text-white/20 text-8xl font-black select-none">
                  {news[0].category.charAt(0)}
                </span>
                <div className="absolute top-4 left-4 bg-brand-50 text-brand text-xs font-bold px-2.5 py-1 rounded-full">
                  {news[0].category}
                </div>
              </div>
              <div className="p-6">
                <div className="text-slate-400 text-xs mb-3">{news[0].date} · {news[0].readTime}</div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand transition-colors leading-snug">
                  {news[0].title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{news[0].excerpt}</p>
                <Link to="/news" className="text-sm font-bold text-brand hover:underline">
                  Read more →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {news.slice(1, 3).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Rest */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(3).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  )
}
