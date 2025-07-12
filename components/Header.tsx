'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notification count
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotificationCount();
    }
  }, [session]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/count');
      const data = await response.json();
      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/questions?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/questions" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QA Forum</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/questions" className="text-gray-700 hover:text-blue-600 transition-colors">
              Questions
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tags
            </Link>
            {session ? (
              <Link href="/questions/ask" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Ask Question
              </Link>
            ) : (
              <Link href="/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            )}
          </nav>

          {/* User Menu */}
          {session && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Notification Button */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                >
                  <FaBell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
                
                {isNotificationOpen && (
                  <NotificationDropdown 
                    onClose={() => setIsNotificationOpen(false)} 
                    onUpdateCount={fetchNotificationCount}
                  />
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span>{session.user?.username}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaUser className="mr-2" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/questions"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Questions
              </Link>
              <Link
                href="/tags"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Tags
              </Link>
              {session ? (
                <>
                  <Link
                    href="/questions/ask"
                    className="block px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Ask Question
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 