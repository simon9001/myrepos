import { Link } from 'react-router-dom'
import { Heart, Globe, Shield, Lightbulb, ChevronRight, ArrowRight } from 'lucide-react'
import { team, timeline, stats } from '../data/mockData'
import SectionHeader from '../components/ui/SectionHeader'
import CTABanner from '../components/home/CTABanner'

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    desc: 'Every decision we make starts with the question: how does this serve our customers better?',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    desc: 'We only stock and recommend products that meet our rigorous technical and quality standards.',
  },
  {
    icon: Globe,
    title: 'Pan-African Vision',
    desc: 'Growing our reach to ensure every African community has access to water and clean energy.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'From IoT monitoring to smart solar, we continuously invest in the technology of tomorrow.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-dark to-brand py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-100 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span>About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            Africa's Leader in Water &<br />Energy Solutions Since 1948
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            For over 75 years, Davis & Shirtliff has been at the forefront of water supply, energy generation,
            and sustainability solutions across East and Central Africa.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-brand-100 text-sm font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <section id="story" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                eyebrow="Our Story"
                title="Over 75 Years of Building Africa's Water Future"
              />
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Davis & Shirtliff was established in Nairobi, Kenya in 1948. What started as a small
                  water pump distributor has grown into East Africa's leading supplier of water, energy,
                  and machinery solutions — operating in 10 countries with over 50 branch locations.
                </p>
                <p>
                  Over the decades, we have introduced global brands to the East African market, developed
                  our own Dayliff product range, and pioneered innovations like the iDayliff IoT platform
                  for smart water management.
                </p>
                <p>
                  Our <strong className="text-slate-900">#ImprovingLives</strong> mission guides everything
                  we do — from community water access projects to training the next generation of African
                  water engineers.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors"
                >
                  Contact Us <ArrowRight size={16} />
                </Link>
                <Link
                  to="/news"
                  className="inline-flex items-center gap-2 border-2 border-brand text-brand px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-colors"
                >
                  CSR Report 2025
                </Link>
              </div>
            </div>

            {/* Visual placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-brand-dark to-brand rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-white px-8">
                  <div className="text-6xl font-black mb-2 opacity-30">D&S</div>
                  <div className="text-2xl font-black mb-1">Est. 1948</div>
                  <div className="text-blue-200 text-sm">Nairobi, Kenya</div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-slate-100">
                <div className="text-3xl font-black text-brand">75+</div>
                <div className="text-slate-500 text-xs font-semibold">Years of excellence</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-slate-100">
                <div className="text-3xl font-black text-green">10+</div>
                <div className="text-slate-500 text-xs font-semibold">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Mission & Vision"
            title="What Drives Us Every Day"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-brand rounded-2xl p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-100 mb-3">Our Mission</div>
              <p className="text-lg font-semibold leading-relaxed">
                To provide high-quality, reliable water, energy, and machinery solutions that improve the
                lives of people and businesses across Africa.
              </p>
            </div>
            <div className="bg-green rounded-2xl p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-green-light mb-3">Our Vision</div>
              <p className="text-lg font-semibold leading-relaxed">
                To be Africa's most trusted and innovative partner for water and energy solutions,
                reaching every community on the continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our Values"
            title="The Principles Behind Every Decision"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-surface hover:bg-white border border-slate-100 hover:border-brand-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg text-center"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand transition-colors">
                  <Icon size={22} className="text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our History"
            title="75+ Years of Milestones"
            light
            centered
          />
          <div className="relative max-w-3xl mx-auto">
            {/* Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-6 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand border-2 border-brand-light mt-1 z-10" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-24px)] bg-white/5 border border-white/10 rounded-xl p-5 ${i % 2 !== 0 ? 'md:mr-12' : 'md:ml-12'}`}>
                    <div className="text-brand-100 font-black text-lg mb-1">{item.year}</div>
                    <div className="text-white font-bold mb-1">{item.title}</div>
                    <div className="text-slate-400 text-sm">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Leadership"
            title="Our Executive Team"
            description="Experienced leaders driving D&S's pan-African vision."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="group bg-surface hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-100 hover:shadow-lg transition-all duration-300 text-center"
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-4 text-white font-black text-2xl">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-bold text-slate-900 mb-0.5">{member.name}</h3>
                <div className="text-brand text-sm font-semibold mb-3">{member.role}</div>
                <div className="inline-block bg-brand-50 text-brand text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  {member.department}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  )
}
