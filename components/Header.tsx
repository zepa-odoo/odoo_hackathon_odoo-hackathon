'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaSignOutAlt, FaBell, FaCog } from 'react-icons/fa';
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
    <header className="bg-[#161b22] shadow-github border-b border-[#30363d] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/questions" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-lg flex items-center justify-center shadow-github">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#f0f6fc]">StackIt</span>
              <span className="text-xs text-[#7d8590]">Q&A Community</span>
            </div>
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
                  className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238636] focus:border-[#238636] text-[#c9d1d9] placeholder-[#7d8590] transition-github"
                />
                <FaSearch className="absolute left-3 top-3 text-[#7d8590]" />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/questions" className="text-[#c9d1d9] hover:text-[#f0f6fc] transition-github">
              Questions
            </Link>
            <Link href="/tags" className="text-[#c9d1d9] hover:text-[#f0f6fc] transition-github">
              Tags
            </Link>
            {session ? (
              <Link href="/questions/ask" className="btn-primary">
                Ask Question
              </Link>
            ) : (
              <Link href="/auth/signin" className="btn-primary">
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
                  className="p-2 text-[#c9d1d9] hover:text-[#f0f6fc] transition-github relative"
                >
                  <FaBell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#da3633] rounded-full text-xs text-white flex items-center justify-center px-1">
                      {notificationCount > 9 ? '9+' : notificationCount}
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
                  className="flex items-center space-x-2 text-[#c9d1d9] hover:text-[#f0f6fc] transition-github"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span>{session.user?.username}</span>
                  {session.user?.role === 'admin' && (
                    <span className="badge badge-info text-xs">Admin</span>
                  )}
                  {session.user?.role === 'master' && (
                    <span className="badge badge-warning text-xs">Master</span>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#161b22] rounded-lg shadow-github-lg border border-[#30363d] py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] transition-github"
                    >
                      <FaUser className="mr-2" />
                      My Profile
                    </Link>
                    {(session.user?.role === 'admin' || session.user?.role === 'master') && (
                      <Link
                        href="/admin-panel"
                        className="flex items-center px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] transition-github"
                      >
                        <FaCog className="mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] transition-github"
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
              className="text-[#c9d1d9] hover:text-[#f0f6fc] transition-github"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#161b22] border-t border-[#30363d]">
              <Link
                href="/questions"
                className="block px-3 py-2 text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-github rounded-lg"
              >
                Questions
              </Link>
              <Link
                href="/tags"
                className="block px-3 py-2 text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-github rounded-lg"
              >
                Tags
              </Link>
              {session ? (
                <>
                  <Link
                    href="/questions/ask"
                    className="block px-3 py-2 text-[#238636] hover:text-[#2ea043] hover:bg-[#21262d] transition-github rounded-lg"
                  >
                    Ask Question
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-github rounded-lg"
                  >
                    My Profile
                  </Link>
                  {(session.user?.role === 'admin' || session.user?.role === 'master') && (
                    <Link
                      href="/admin-panel"
                      className="block px-3 py-2 text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-github rounded-lg"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-github rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-[#238636] hover:text-[#2ea043] hover:bg-[#21262d] transition-github rounded-lg"
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