interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function SkeletonLoader({ count = 1, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-xl h-20 animate-shimmer"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>
      ))}
    </div>
  );
}

