'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-blue-600"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50"
        >
          <nav className="flex flex-col" aria-label="Mobile navigation">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 border-b"
            >
              Links
            </Link>
            <Link
              href="/dashboard/links/new"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 border-b"
            >
              New Link
            </Link>
            <div className="px-4 py-3 border-b">
              <span className="text-sm text-gray-600" aria-label={`Logged in as ${user?.username}`}>
                {user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              aria-label="Logout"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

