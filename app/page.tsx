'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200" aria-label="Main navigation">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <a href="/" aria-label="DynamicLinker Home" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all">
                DynamicLinker
              </a>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/login"
                className="px-5 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all hover:scale-105"
                aria-label="Login to your account"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                aria-label="Create a new account"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 -z-10"></div>
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                Dynamic Link Management Platform
              </span>
            </div>
            <h1 
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight" 
              id="main-heading"
            >
              Short Links,
              <br />
              Long Reach
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Create short, memorable links that you can update anytime.
              Track your links and see where your traffic is coming from.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                aria-label="Get started by creating an account"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-200"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Dynamic Links</h3>
                <p className="text-slate-600 leading-relaxed">
                  Update your link destinations anytime without changing the short URL. Complete flexibility at your fingertips.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track clicks, referers, countries, and more with detailed statistics. Make data-driven decisions.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Fast & Reliable</h3>
                <p className="text-slate-600 leading-relaxed">
                  Powered by Redis caching for lightning-fast redirects. Your links work instantly, every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
