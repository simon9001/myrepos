import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, ArrowRight, Send } from 'lucide-react'

const footerSections = [
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Mission & Vision', href: '/about' },
      { label: 'Executive Team', href: '/about' },
      { label: '#ImprovingLives CSR', href: '/about' },
      { label: 'Company History', href: '/about' },
      { label: 'Careers', href: '/contact' },
      { label: 'Corporate Video', href: '/news' },
    ],
  },
  {
    title: 'Branches',
    links: [
      { label: 'Kenya', href: '/contact' },
      { label: 'Uganda', href: '/contact' },
      { label: 'Tanzania', href: '/contact' },
      { label: 'Zambia', href: '/contact' },
      { label: 'Rwanda', href: '/contact' },
      { label: 'Ethiopia', href: '/contact' },
      { label: 'DRC', href: '/contact' },
      { label: 'Zimbabwe', href: '/contact' },
      { label: 'Senegal', href: '/contact' },
      { label: 'Somalia', href: '/contact' },
    ],
  },
  {
    title: 'Service & Support',
    links: [
      { label: 'Shop Online', href: '/contact' },
      { label: 'Spare Parts', href: '/contact' },
      { label: 'D&S FLO App', href: '/products/controllers' },
      { label: 'iDayliff IoT', href: '/products/controllers' },
      { label: 'Technical Manuals', href: '/contact' },
      { label: 'PumpCalc Tool', href: '/products/water-pumps' },
      { label: 'SolarCalc Tool', href: '/products/solar' },
      { label: 'Financing Options', href: '/contact' },
    ],
  },
  {
    title: 'News & Media',
    links: [
      { label: 'Latest News', href: '/news' },
      { label: 'Press Releases', href: '/news' },
      { label: 'Photo Gallery', href: '/news' },
      { label: 'Videos', href: '/news' },
      { label: 'CSR Reports', href: '/news' },
      { label: 'FAQs', href: '/contact' },
      { label: 'Customer Feedback', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/' },
      { label: 'Privacy Policy', href: '/' },
      { label: 'Warranty Terms', href: '/' },
      { label: 'Returns Policy', href: '/' },
      { label: 'Cookie Policy', href: '/' },
    ],
  },
]

const socials = [
  { letter: 'f',  label: 'Facebook',  href: '/' },
  { letter: 'X',  label: 'Twitter/X', href: '/' },
  { letter: 'in', label: 'LinkedIn',  href: '/' },
  { letter: 'yt', label: 'YouTube',   href: '/' },
  { letter: 'ig', label: 'Instagram', href: '/' },
]

const products = [
  { label: 'Water Pumps', href: '/products/water-pumps' },
  { label: 'Solar Solutions', href: '/products/solar' },
  { label: 'Generators', href: '/products/generators' },
  { label: 'Swimming Pools', href: '/products/swimming-pools' },
  { label: 'Water Treatment', href: '/products/water-treatment' },
  { label: 'Irrigation', href: '/products/irrigation' },
  { label: 'Controllers & IoT', href: '/products/controllers' },
  { label: 'Borehole Solutions', href: '/products/borehole-solutions' },
  { label: 'General Machinery', href: '/products/general-machinery' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Newsletter banner */}
      <div className="bg-brand">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Stay Informed</h3>
            <p className="text-blue-100 text-sm">Get the latest news, product launches, and technical insights.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-72 px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="flex items-center gap-2 bg-white text-brand px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shrink-0">
              <Send size={14} /> Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-flex items-center gap-1 group"
                    >
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Products quick links */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
            Products & Solutions
          </h4>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <Link
                key={p.label}
                to={p.href}
                className="text-xs bg-slate-800 hover:bg-brand text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-all"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo + contact */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">D&S</span>
              </div>
              <div>
                <div className="text-white font-black text-sm">Davis & Shirtliff</div>
                <div className="text-brand-100 text-xs">Water & Energy Solutions</div>
              </div>
            </Link>
            <div className="space-y-1.5">
              <a href="tel:+254711079000" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors">
                <Phone size={12} /> +254 711 079 000
              </a>
              <a href="mailto:ContactCenter@dayliff.com" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors">
                <Mail size={12} /> ContactCenter@dayliff.com
              </a>
              <p className="flex items-center gap-2 text-slate-500 text-xs">
                <MapPin size={12} /> Dundori Road, Industrial Area, Nairobi, Kenya
              </p>
            </div>
          </div>

          {/* Socials + payments */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex items-center gap-2">
              {socials.map(({ letter, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand flex items-center justify-center text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-tight"
                >
                  {letter}
                </a>
              ))}
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              {['M-PESA', 'VISA', 'Mastercard'].map(method => (
                <span
                  key={method}
                  className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded font-semibold border border-slate-700"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Davis & Shirtliff Group. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            The Leader in Water & Energy Solutions across East Africa
          </p>
        </div>
      </div>
    </footer>
  )
}
