'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import { MobileMenu } from './MobileMenu';

export function DashboardNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-slate-200 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DynamicLinker
              </span>
            </Link>
            <nav aria-label="Main navigation" className="hidden md:block">
              <div className="flex space-x-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  aria-current="page"
                >
                  My Links
                </Link>
                <Link
                  href="/dashboard/links/new"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  + New Link
                </Link>
              </div>
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700" aria-label={`Logged in as ${user?.username}`}>
                {user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}

