'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ChefHat, Package, ShoppingCart, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navigation on homepage for non-authenticated users
  if (!session && pathname === '/') {
    return null;
  }

  const navigation = [
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Meals', href: '/meals', icon: ChefHat },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Shopping', href: '/shopping', icon: ShoppingCart },
  ];

  if (session?.user?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: Users });
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="nav-modern sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link 
            href={session ? '/calendar' : '/'} 
            className="flex items-center space-x-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              MealPlanner
            </span>
          </Link>

          {/* Desktop Navigation */}
          {session && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link-modern flex items-center space-x-1 ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop User Menu */}
          {session && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="nav-link-modern flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Auth Links for Non-authenticated Users */}
          {!session && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link
                href="/api/auth/signin"
                className="nav-link-modern"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary-modern"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-link-modern p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {session ? (
                <>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`nav-link-modern flex items-center space-x-2 w-full ${
                          isActive ? 'active' : ''
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                      {session.user?.name || session.user?.email}
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="nav-link-modern flex items-center space-x-2 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/api/auth/signin"
                    className="nav-link-modern flex items-center w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="btn-primary-modern flex items-center justify-center w-full mt-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
