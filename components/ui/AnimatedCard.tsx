import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}: AnimatedCardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

