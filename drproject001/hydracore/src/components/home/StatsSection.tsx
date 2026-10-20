import { Users, Globe, Building2, Package } from 'lucide-react'
import { stats } from '../../data/mockData'

const icons = [Users, Globe, Building2, Package]

export default function StatsSection() {
  return (
    <section className="bg-brand-dark py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => {
            const Icon = icons[i % icons.length]
            return (
              <div
                key={stat.label}
                className="group text-center relative"
              >
                {/* Divider */}
                {i > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
                )}

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-3 group-hover:bg-brand transition-colors">
                  <Icon size={22} className="text-white/70 group-hover:text-white transition-colors" />
                </div>

                <div className="text-4xl md:text-5xl font-black text-white mb-1 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-brand-100 font-bold text-sm mb-1">
                  {stat.label}
                </div>
                <div className="text-white/40 text-xs">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
