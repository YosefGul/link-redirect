import { ProtectedRoute } from '@/components/dashboard/ProtectedRoute';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
          <DashboardNav />
          <main id="main-content" className="container mx-auto px-4 py-8 animate-fade-in" tabIndex={-1}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

