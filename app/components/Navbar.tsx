"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Users, Compass, MessageCircle, Menu, X, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const res = await fetch(`/api/search/users?q=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.users);
            setIsSearching(true);
          }
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navItems: NavItem[] = [
    { label: 'For You', icon: <Bell className="w-5 h-5" />, href: '/notifications' },
    { label: 'Following', icon: <Users className="w-5 h-5" />, href: '/following' },
    { label: 'Explore', icon: <Compass className="w-5 h-5" />, href: '/explore' },
    { label: 'Chats', icon: <MessageCircle className="w-5 h-5" />, badge: 3, href: '/chats' },
  ];

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                C
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 text-gray-300 rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearching && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
                          Users
                        </div>
                        {searchResults.map((user) => (
                          <Link
                            key={user._id}
                            href={`/profile/${user._id}`}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                            onClick={() => {
                              setIsSearching(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-pink-500 transition-colors">
                              {user.image ? (
                                <Image src={user.image} alt={user.name || 'User'} width={40} height={40} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                                  {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover:text-pink-400 transition-colors">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {user.followers?.length || 0} followers
                              </p>
                            </div>
                          </Link>
                        ))}
                        <button className="w-full text-center py-2 text-sm text-pink-500 hover:text-pink-400 font-medium border-t border-gray-800 mt-2">
                          View all results
                        </button>
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex flex-col items-center space-y-1 hover:text-pink-500 transition-colors group"
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium hidden lg:block">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {status === 'authenticated' ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <span className="text-sm text-gray-400">My balance</span>
                  <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>

                {/* Profile Image */}
                <div className="relative group">
                  <Link href="/profile">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 overflow-hidden border-2 border-pink-500 cursor-pointer hover:scale-110 transition-transform">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <span className="text-lg font-bold">{session.user?.name?.[0]}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold hover:text-pink-500 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-800 text-gray-300 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-3 space-y-3">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {status === 'authenticated' && (
              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-400">My balance</span>
                  <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 flex items-center space-x-3 rounded-lg mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;