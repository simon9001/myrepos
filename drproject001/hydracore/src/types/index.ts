export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  shortDesc: string
  price?: string
  image: string
  brand: string
  featured: boolean
  isNew?: boolean
  isBestSeller?: boolean
  tags: string[]
  specs?: Record<string, string>
}

export interface Subcategory {
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  icon: string
  image: string
  color: string
  subcategories: Subcategory[]
}

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
  slug: string
  author: string
  readTime: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  image: string
  bio: string
}

export interface Branch {
  id: string
  country: string
  city: string
  address: string
  phone: string
  email: string
  isHeadquarters: boolean
}

export interface Stat {
  value: string
  label: string
  description: string
}

export interface Testimonial {
  id: string
  name: string
  company: string
  role: string
  content: string
  rating: number
  image: string
}

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  gradient: string
  tag: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
