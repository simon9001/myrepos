import { Link } from 'react-router-dom'
import { Heart, Droplets, Sun, Leaf, ArrowRight } from 'lucide-react'

const pillars = [
  {
    icon: Droplets,
    title: 'Clean Water Access',
    desc: 'Providing safe drinking water to millions through borehole, filtration, and treatment projects.',
  },
  {
    icon: Sun,
    title: 'Renewable Energy',
    desc: 'Solar installations that bring reliable electricity and pumping to off-grid communities.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Farming',
    desc: 'Irrigation solutions that help smallholder farmers improve yields and livelihoods.',
  },
  {
    icon: Heart,
    title: 'Community Health',
    desc: 'Supporting schools and health facilities with water, sanitation, and hygiene infrastructure.',
  },
]

export default function ImprovingLives() {
  return (
    <section className="relative py-24 overflow-hidden bg-brand-dark">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-100 mb-4">
            <Heart size={12} className="text-orange" fill="currentColor" />
            #ImprovingLives
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            For Over 75 Years, We've Been<br />
            <span className="text-brand-100">Improving Lives</span> Across Africa
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Every pump installed, every solar panel mounted, every borehole drilled — it all adds up to real impact
            for real people in communities across East and Central Africa.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-brand/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand transition-colors">
                <Icon size={22} className="text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
          {[
            { value: '500,000+', label: 'Lives Improved' },
            { value: '1,200+', label: 'Community Projects' },
            { value: '12 Counties', label: 'In Kenya Alone' },
            { value: 'KES 2.5B+', label: 'CSR Investment' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-white text-brand-dark px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Read the Full Impact Story <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
