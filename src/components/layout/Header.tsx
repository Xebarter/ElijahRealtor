import { Link } from 'react-router-dom';
import { X, Home, Building, Phone, BookOpen, LogIn, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useState, useRef, useEffect } from 'react';

// Add Cinzel font to the document
const addCinzelFont = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    addCinzelFont();
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Testimonials', href: '/testimonials', icon: Star },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Elijah Realtor Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-wider text-[#ffd51e] font-cinzel">ElijahRealtor</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-gold transition-colors duration-300 group font-cinzel"
              >
                <item.icon className="w-5 h-5 text-primary-gold/80 group-hover:text-primary-gold" />
                <span className="font-medium tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4 font-cinzel">
            {isAdmin || user ? (
              <Link to={isAdmin ? "/admin" : "/profile"} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-gold/10 flex items-center justify-center border border-primary-gold/30 hover:bg-primary-gold/20 transition-colors duration-300">
                  <User className="w-5 h-5 text-primary-gold" />
                </div>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-gold/10 flex items-center justify-center border border-primary-gold/30 hover:bg-primary-gold/20 transition-colors duration-300">
                  <User className="w-5 h-5 text-primary-gold" />
                </div>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-white hover:bg-white/10 z-50"
            >
              {isMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <div className="w-7 h-7 flex flex-col justify-around items-center" aria-hidden="true">
                  <span className="block h-0.5 w-6 bg-white rounded-sm transition-all duration-300"></span>
                  <span className="block h-0.5 w-6 bg-white rounded-sm transition-all duration-300"></span>
                  <span className="block h-0.5 w-6 bg-white rounded-sm transition-all duration-300"></span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          ref={menuRef}
          className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-[#0A0A0A] shadow-xl transform transition-transform duration-300 border-l-2 border-red-600 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-full flex flex-col">
            {/* Close Button */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
              <h2 className="text-xl font-bold text-white font-cinzel">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-lg font-bold text-[#ffd51e] hover:bg-[#1a1a1a] rounded-lg px-4 py-3 transition-colors duration-300 font-cinzel border-b border-[#1a1a1a] hover:border-red-500/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-6 h-6 text-[#ffd51e]" />
                    <span className="text-[#ffd51e]">{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 space-y-4">
                {isAdmin ? (
                  <Link 
                    to="/admin"
                    className="w-full flex items-center justify-center space-x-3 bg-[#1a1a1a] text-[#ffd51e] hover:bg-[#222222] hover:text-[#ffd51e] transition-all duration-300 border border-red-500 hover:border-red-600 rounded-lg px-4 py-3 font-cinzel"
                  >
                    <span>Admin</span>
                  </Link>
                ) : user ? (
                  <Link to="/profile" className="w-full flex items-center justify-center space-x-3 py-3">
                    <div className="w-12 h-12 rounded-full bg-[#ffd51e]/10 flex items-center justify-center border border-[#ffd51e]/30 hover:border-[#ffd51e]/50 transition-colors">
                      <User className="w-6 h-6 text-[#ffd51e]" />
                    </div>
                  </Link>
                ) : (
                  <Link to="/login" className="w-full flex items-center justify-center py-3">
                    <div className="w-12 h-12 rounded-full bg-[#ffd51e]/10 flex items-center justify-center border border-[#ffd51e]/30 hover:bg-[#ffd51e]/20 transition-colors duration-300">
                      <User className="w-6 h-6 text-[#ffd51e]" />
                    </div>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
