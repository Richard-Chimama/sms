'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificationIndicator } from '@/components/notifications/NotificationIndicator';
import { Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleSidebar, isSidebarOpen } = useStore();

  if (!session?.user) return null;

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="text-gray-300 hover:text-gray-100 lg:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-gray-100">
              School MS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationIndicator />

            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="hidden sm:block text-sm font-medium">
                  {session.user.name}
                </span>
                <svg
                  className={`h-5 w-5 transition-transform ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-700">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="block sm:hidden px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                      {session.user.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      role="menuitem"
                      onClick={() => signOut()}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 