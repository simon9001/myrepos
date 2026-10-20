import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { news } from '../../data/mockData'
import NewsCard from '../ui/NewsCard'
import SectionHeader from '../ui/SectionHeader'

export default function NewsSection() {
  const latest = news.slice(0, 3)

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <SectionHeader
            eyebrow="News & Media"
            title="Latest from Davis & Shirtliff"
            description="Stay up to date with innovations, expansions, and community impact stories."
          />
          <Link
            to="/news"
            className="hidden md:inline-flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all shrink-0"
          >
            All news & media <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all"
          >
            All news & media <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
