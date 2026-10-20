import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu, X, ChevronDown, Phone, Search, MapPin, ShoppingBag,
} from 'lucide-react'
import { navItems } from '../../data/mockData'
import type { NavItem } from '../../types'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (label: string) => {
    setActiveDropdown(prev => (prev === label ? null : label))
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-dark text-white text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+254711079000" className="flex items-center gap-1.5 hover:text-brand-100 transition-colors">
              <Phone size={11} /> +254 711 079 000
            </a>
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={11} /> Dundori Road, Industrial Area, Nairobi
            </span>
          </div>
          <div className="flex items-center gap-5 text-slate-300">
            {['Kenya', 'Uganda', 'Tanzania', 'Zambia'].map(c => (
              <button key={c} className="hover:text-white transition-colors">{c}</button>
            ))}
            <span className="w-px h-3 bg-slate-600" />
            <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1">
              <ShoppingBag size={11} /> Shop Online
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white shadow-sm'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-0" ref={dropdownRef}>
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">D&S</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-slate-900 text-base leading-tight">Davis & Shirtliff</div>
                <div className="text-brand text-xs font-semibold tracking-wide leading-tight">Water & Energy Solutions</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 h-full">
              {navItems.map((item: NavItem) => (
                <div key={item.label} className="relative h-full flex items-center">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeDropdown === item.label
                            ? 'text-brand bg-brand-50'
                            : 'text-slate-700 hover:text-brand hover:bg-brand-50'
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {activeDropdown === item.label && (
                        <div className="dropdown-enter absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 min-w-52 py-2 z-50">
                          {item.label === 'Products & Solutions' ? (
                            <div className="grid grid-cols-2 gap-0 p-3">
                              {item.children.map((child: NavItem) => (
                                <Link
                                  key={child.label}
                                  to={child.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:text-brand hover:bg-brand-50 transition-colors font-medium"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            item.children.map((child: NavItem) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:text-brand hover:bg-brand-50 transition-colors font-medium"
                              >
                                {child.label}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname === item.href
                          ? 'text-brand bg-brand-50'
                          : 'text-slate-700 hover:text-brand hover:bg-brand-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(s => !s)}
                className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand-50 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                to="/contact"
                className="hidden md:inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors shadow-sm"
              >
                <Phone size={14} /> Contact Us
              </Link>

              <button
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-brand hover:bg-brand-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="dropdown-enter border-t border-slate-100 py-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, solutions, brands…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navItems.map((item: NavItem) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 font-semibold text-sm hover:bg-brand-50 hover:text-brand transition-colors"
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {activeDropdown === item.label && (
                        <div className="mt-1 ml-3 border-l-2 border-brand-100 pl-4 space-y-1">
                          {item.children.map((child: NavItem) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block py-2 text-sm text-slate-600 hover:text-brand transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="block px-3 py-2.5 rounded-lg text-slate-700 font-semibold text-sm hover:bg-brand-50 hover:text-brand transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to="/contact"
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"
                >
                  <Phone size={14} /> Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
