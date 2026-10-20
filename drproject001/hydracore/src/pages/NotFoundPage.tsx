import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-surface">
      <div className="text-center px-6 max-w-lg">
        {/* 404 visual */}
        <div className="text-[120px] font-black text-slate-100 leading-none select-none mb-2">
          404
        </div>
        <div className="w-16 h-1.5 bg-brand rounded-full mx-auto mb-6" />

        <h1 className="text-2xl font-black text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or the URL might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors"
          >
            <Home size={16} /> Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:border-brand hover:text-brand transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:border-brand hover:text-brand transition-colors"
          >
            <Search size={16} /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
