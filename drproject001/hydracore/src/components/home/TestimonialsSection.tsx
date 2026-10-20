import { Star, Quote } from 'lucide-react'
import { testimonials } from '../../data/mockData'
import SectionHeader from '../ui/SectionHeader'

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Customer Stories"
          title="Trusted by Thousands Across Africa"
          description="See how Davis & Shirtliff solutions are making a real difference for homes, farms, and businesses."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="group bg-surface hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-100 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-brand/20 mb-4" fill="currentColor" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">
                "{t.content}"
              </p>

              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-black text-sm shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-slate-400 text-xs">{t.role}, {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
