import { Link } from 'react-router-dom';
import { Menu, X, Home, Building, Phone, BookOpen, LogIn, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useState, useRef, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuthStore();

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Testimonials', href: '/testimonials', icon: Star },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary-navy rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-primary-navy truncate">ElijahRealtor</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 sm:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-navy transition-colors duration-200 text-sm sm:text-base"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            {isAdmin ? (
              <Link to="/admin">
                <Button className="btn-primary px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">Admin</Button>
              </Link>
            ) : user ? (
              <span className="text-xs sm:text-sm text-gray-600 truncate">Welcome, {user.user_metadata?.full_name || user.email}</span>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-base">
                  <LogIn className="w-4 h-4" />
                  <span>Admin Login</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 bg-primary-navy hover:bg-primary-gold"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden border-t border-gray-200 py-4 animate-slide-in bg-primary-navy text-white shadow-2xl fixed left-0 top-0 w-full h-full z-50"
          >
            <nav className="flex flex-col space-y-2 sm:space-y-4 mt-16 px-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 text-white hover:text-primary-gold transition-colors duration-200 px-2 sm:px-4 py-3 text-lg font-semibold rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="px-2 sm:px-4 pt-4 border-t border-gray-700 mt-4">
                {isAdmin ? (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-primary px-3 sm:px-4 py-2 text-base">Admin</Button>
                  </Link>
                ) : !user ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-base">
                      <LogIn className="w-4 h-4" />
                      <span>Admin Login</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;