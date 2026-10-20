import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { heroSlides } from '../../data/mockData'

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (transitioning) return
    setTransitioning(true)
    setCurrent(index)
    setTimeout(() => setTransitioning(false), 600)
  }, [transitioning])

  const next = useCallback(() => {
    goTo((current + 1) % heroSlides.length)
  }, [current, goTo])

  const prev = () => {
    goTo((current - 1 + heroSlides.length) % heroSlides.length)
  }

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = heroSlides[current]

  return (
    <section className="relative overflow-hidden h-[90vh] min-h-[580px] max-h-[800px]">
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: slide.gradient }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
        <div
          key={current}
          className="slide-in max-w-2xl"
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" />
            {slide.tag}
          </div>

          {/* Subtitle */}
          <div className="text-white/70 font-semibold text-sm tracking-wide mb-2 uppercase">
            {slide.subtitle}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] mb-5">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {slide.ctaText} <ArrowRight size={16} />
            </Link>
            <Link
              to={slide.secondaryCtaLink}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/25 transition-all"
            >
              {slide.secondaryCtaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 h-2.5 bg-white'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 text-white/50 text-xs font-bold tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
      </div>
    </section>
  )
}
