import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone, Mail, MapPin, Clock, ChevronRight,
  Send, Building2, CheckCircle,
} from 'lucide-react'
import { branches, faqs } from '../data/mockData'
import SectionHeader from '../components/ui/SectionHeader'

interface FormData {
  name: string
  email: string
  phone: string
  country: string
  subject: string
  message: string
}

const countries = ['Kenya', 'Uganda', 'Tanzania', 'Zambia', 'Rwanda', 'Ethiopia', 'DRC', 'Zimbabwe', 'Senegal', 'Somalia', 'Other']
const subjects = [
  'Product Enquiry',
  'Technical Support',
  'Request a Quote',
  'Spare Parts',
  'Service Contract',
  'Careers',
  'General Enquiry',
]

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', country: '', subject: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const hq = branches.find(b => b.isHeadquarters)
  const otherBranches = branches.filter(b => !b.isHeadquarters)

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-dark to-brand py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-100 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span>Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Our technical team is ready to assist — whether you need a product recommendation,
            quote, or after-sales support.
          </p>
        </div>
      </div>

      {/* Quick contact cards */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Phone, title: 'Call Us', value: '+254 711 079 000', sub: 'Mon–Fri 8am–5pm EAT', color: 'bg-brand' },
            { icon: Mail, title: 'Email Us', value: 'ContactCenter@dayliff.com', sub: 'We respond within 24 hours', color: 'bg-green' },
            { icon: MapPin, title: 'Head Office', value: 'Dundori Road, Nairobi', sub: 'Industrial Area, Kenya', color: 'bg-orange' },
          ].map(({ icon: Icon, title, value, sub, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 items-start">
              <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 mb-0.5">{title}</div>
                <div className="text-slate-700 text-sm font-semibold">{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <SectionHeader
                eyebrow="Send a Message"
                title="How Can We Help?"
                description="Fill out the form and a member of our team will get back to you within one business day."
              />

              {submitted ? (
                <div className="bg-green-light border border-green/20 rounded-2xl p-8 text-center">
                  <CheckCircle size={48} className="text-green mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 text-sm">
                    Thank you for reaching out. We'll get back to you within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-orange">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+254 7XX XXX XXX"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Country <span className="text-orange">*</span>
                      </label>
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface"
                      >
                        <option value="">Select country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Subject <span className="text-orange">*</span>
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-orange">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us about your project or enquiry…"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white py-4 px-6 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm hover:shadow-md"
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Branches + Hours */}
            <div className="space-y-8">
              {/* Head Office */}
              {hq && (
                <div className="bg-brand-dark rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                      <Building2 size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold">Head Office — {hq.city}</div>
                      <div className="text-brand-100 text-xs">{hq.country}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-brand-100" />
                      {hq.address}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-brand-100" />
                      <a href={`tel:${hq.phone}`} className="hover:text-white">{hq.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail size={14} className="text-brand-100" />
                      <a href={`mailto:${hq.email}`} className="hover:text-white">{hq.email}</a>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              <div className="bg-surface rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={20} className="text-brand" />
                  <h3 className="font-bold text-slate-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM EAT' },
                    { day: 'Saturday', hours: '8:00 AM – 1:00 PM EAT' },
                    { day: 'Sunday & Public Holidays', hours: 'Closed' },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600 font-medium">{day}</span>
                      <span className={`font-semibold ${hours === 'Closed' ? 'text-red-500' : 'text-slate-900'}`}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country Branches */}
              <div className="bg-surface rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Country Branches</h3>
                <div className="grid grid-cols-2 gap-2">
                  {otherBranches.map(b => (
                    <div key={b.id} className="bg-white rounded-xl p-3 border border-slate-100">
                      <div className="font-semibold text-slate-900 text-sm">{b.country}</div>
                      <div className="text-slate-400 text-xs">{b.city}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader
            eyebrow="FAQs"
            title="Frequently Asked Questions"
            centered
          />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 text-sm pr-4">{faq.question}</span>
                  <ChevronRight
                    size={16}
                    className={`text-brand shrink-0 transition-transform ${openFaq === faq.id ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
