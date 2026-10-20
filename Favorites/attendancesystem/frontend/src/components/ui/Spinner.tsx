import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?:    number;
  label?:   string;
  fullPage?: boolean;
}

export function Spinner({ size = 24, label, fullPage = false }: SpinnerProps) {
  const inner = (
    <div className="flex flex-col items-center gap-3 text-steel">
      <Loader2 size={size} className="animate-spin text-primary" />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-canvas/80 backdrop-blur-sm z-50">
        {inner}
      </div>
    );
  }

  return inner;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner size={32} label={label} />
    </div>
  );
}
