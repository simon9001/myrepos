import { Link } from 'react-router-dom'
import { Phone, ArrowRight, MapPin } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-r from-brand to-brand-dark">
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute right-24 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Ready to Find Your Solution?
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Talk to our technical team. Whether it's sizing a pump, designing a solar system, or planning
            a complete water treatment plant — we're here to help, at no cost.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand px-7 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-0.5"
          >
            <Phone size={16} /> Contact Us Today
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white px-7 py-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
          >
            <MapPin size={16} /> Find a Branch <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
