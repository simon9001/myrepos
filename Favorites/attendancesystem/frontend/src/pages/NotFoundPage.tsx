import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-ink/10 mb-4 select-none">404</p>
        <h1 className="text-h4 font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-sm text-steel mb-6">
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link to="/">
          <Button iconLeft={<ArrowLeft size={15} />}>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
