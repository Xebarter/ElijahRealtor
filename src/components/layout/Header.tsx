import { Link } from 'react-router-dom';
import { X, Home, Building, Phone, BookOpen, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useState, useRef, useEffect } from 'react';

// Load Cinzel font
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

  // Close menu on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Testimonials', href: '/testimonials', icon: Star },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Elijah Realtor Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-wider text-[#ffd51e] font-cinzel">ElijahRealtor</span>
          </Link>

          {/* Desktop Nav */}
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

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 font-cinzel">
            {isAdmin || user ? (
              <Link to={isAdmin ? "/admin" : "/profile"}>
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-[#ffd51e] hover:bg-gray-900 transition-colors duration-300">
                  <User className="w-5 h-5 text-[#ffd51e]" />
                </div>
              </Link>
            ) : (
              <Link to="/login">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-[#ffd51e] hover:bg-gray-900 transition-colors duration-300">
                  <User className="w-5 h-5 text-[#ffd51e]" />
                </div>
              </Link>
            )}
          </div>

          {/* Hamburger / X Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="z-50 p-2 -mr-2 hover:bg-white/10 transition duration-200"
            >
              {isMenuOpen ? (
                <div className="relative w-8 h-8 flex items-center justify-center z-50">
                  <div className="absolute inset-0 bg-[#ffd51e] rounded-full transform scale-90 transition-all duration-300 group-hover:scale-100 group-hover:bg-opacity-90" />
                  <X 
                    className="relative w-5 h-5 text-black transition-transform duration-300 group-hover:rotate-90"
                    strokeWidth={2.5}
                  />
                </div>
              ) : (
                <div className="space-y-[5px] group">
                  <div className="w-6 h-[2px] bg-[#ffd51e] rounded transform transition-all duration-300 group-hover:bg-white group-hover:w-5" />
                  <div className="w-5 h-[2px] bg-[#ffd51e] rounded ml-auto transform transition-all duration-300 group-hover:bg-white group-hover:w-4" />
                  <div className="w-4 h-[2px] bg-[#ffd51e] rounded transform transition-all duration-300 group-hover:bg-white group-hover:w-3" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Slide-in Menu */}
        <div
          ref={menuRef}
          className={`fixed inset-y-0 left-0 w-[70%] max-w-sm h-screen bg-[#0A0A0A] shadow-xl transition-all duration-300 ease-in-out transform border-r-2 border-red-500/70 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-full flex flex-col">
            {/* Menu Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white font-cinzel">Menu</h2>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 text-lg font-bold text-[#ffd51e] hover:bg-[#1a1a1a] hover:text-[#ffd51e] transition-all duration-300 px-4 py-3 w-full rounded-lg font-cinzel hover:pl-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-6 h-6 text-[#ffd51e]" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Auth Actions */}
              <div className="pt-8 space-y-4">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="w-full flex items-center justify-center bg-[#1a1a1a] text-[#ffd51e] hover:bg-[#222] transition-all rounded-lg px-4 py-3 font-cinzel"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Admin</span>
                  </Link>
                ) : user ? (
                  <Link
                    to="/profile"
                    className="flex items-center justify-center py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffd51e]/10 flex items-center justify-center border border-[#ffd51e]/30 hover:border-[#ffd51e]/50 transition-colors">
                      <User className="w-6 h-6 text-[#ffd51e]" />
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
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
