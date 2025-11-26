'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 animate-gradient"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Register Card */}
      <div className="relative max-w-md w-full mx-4 animate-scale-in">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

