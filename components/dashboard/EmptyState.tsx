import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'No links yet',
  description = "Get started by creating your first short link",
  actionLabel = 'Create Your First Link',
  actionHref = '/dashboard/links/new',
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-scale-in">
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-200">
        <div className="mb-6 animate-bounce">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-8 leading-relaxed">{description}</p>
        {actionHref && (
          <Link href={actionHref}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {actionLabel}
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

