import { Link } from 'react-router-dom';
import { X, Home, Building, Phone, BookOpen, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useState, useRef, useEffect } from 'react';

// Load luxury fonts
const addLuxuryFonts = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    addLuxuryFonts();
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
    <>
      <style>{`
        .font-luxury {
          font-family: 'Playfair Display', serif;
          letter-spacing: 0.02em;
        }
        
        .font-luxury-serif {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.05em;
        }
        
        .luxury-nav-spacing {
          letter-spacing: 0.08em;
        }
        
        .gold-hover-glow:hover {
          text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
          transition: text-shadow 0.3s ease;
        }
        
        .mobile-menu-backdrop {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        .hamburger-line {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link-hover {
          position: relative;
          overflow: hidden;
        }
        
        .nav-link-hover::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #FFD700;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link-hover:hover::before {
          width: 100%;
        }
        
        @media (max-width: 374px) {
          .logo-text {
            font-size: 0.875rem !important;
            letter-spacing: 0.03em !important;
          }
        }
        
        @media (min-width: 375px) and (max-width: 424px) {
          .logo-text {
            font-size: 1rem !important;
            letter-spacing: 0.04em !important;
          }
        }
        
        @media (min-width: 425px) and (max-width: 767px) {
          .logo-text {
            font-size: 1.125rem !important;
            letter-spacing: 0.05em !important;
          }
        }
      `}</style>

      <header className="bg-black text-white shadow-2xl sticky top-0 z-50 w-full border-b border-[#FFD700]/20">
        <div className="max-w-[1920px] mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-14 xs:h-16 sm:h-18 md:h-20 lg:h-22 xl:h-24">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0 min-w-0">
              <img 
                src="/logo.svg" 
                alt="Elijah Realtor Logo" 
                className="h-6 xs:h-7 sm:h-8 md:h-10 lg:h-11 xl:h-12 w-auto flex-shrink-0" 
              />
              <span className="logo-text text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[#ffd51e] font-luxury-serif truncate min-w-0">
                ElijahRealtor
              </span>
            </Link>

            {/* Desktop Navigation - Large screens only */}
            <nav className="hidden xl:flex items-center space-x-8 2xl:space-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="nav-link-hover flex items-center space-x-2 text-gray-300 hover:text-[#FFD700] transition-all duration-300 group font-luxury-serif luxury-nav-spacing gold-hover-glow py-2"
                >
                  <item.icon className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FFD700]/80 group-hover:text-[#FFD700] transition-colors duration-300" />
                  <span className="font-medium text-sm 2xl:text-base">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Large Tablet Navigation - Icons with tooltips */}
            <nav className="hidden lg:flex xl:hidden items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center text-gray-300 hover:text-[#FFD700] transition-all duration-300 group p-3 rounded-lg hover:bg-white/5 gold-hover-glow"
                  title={item.name}
                >
                  <item.icon className="w-5 h-5 text-[#FFD700]/80 group-hover:text-[#FFD700] transition-colors duration-300" />
                </Link>
              ))}
            </nav>

            {/* Medium Tablet Navigation - Compact icons */}
            <nav className="hidden md:flex lg:hidden items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center text-gray-300 hover:text-[#FFD700] transition-all duration-300 group p-2 rounded-lg hover:bg-white/5 gold-hover-glow"
                  title={item.name}
                >
                  <item.icon className="w-4 h-4 text-[#FFD700]/80 group-hover:text-[#FFD700] transition-colors duration-300" />
                </Link>
              ))}
            </nav>

            {/* Auth Buttons - Desktop and Tablet */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 xl:space-x-6 font-luxury-serif flex-shrink-0">
              {isAdmin || user ? (
                <Link to={isAdmin ? "/admin" : "/profile"} className="group">
                  <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-black flex items-center justify-center border-2 border-[#ffd51e] hover:bg-gray-900 hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/25">
                    <User className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#ffd51e] group-hover:text-[#FFD700] transition-colors duration-300" />
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="group">
                  <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-black flex items-center justify-center border-2 border-[#ffd51e] hover:bg-gray-900 hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/25">
                    <User className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#ffd51e] group-hover:text-[#FFD700] transition-colors duration-300" />
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative z-[10000] flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="p-2 hover:bg-white/10 transition-all duration-300 relative z-[10001] w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 group"
              >
                {isMenuOpen ? (
                  <div className="relative w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#ffd51e] rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FFD700]" />
                    <X 
                      className="relative w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-black transition-transform duration-300 group-hover:rotate-90"
                      strokeWidth={2.5}
                    />
                  </div>
                ) : (
                  <div className="space-y-1 group">
                    <div className="hamburger-line w-5 h-[2px] xs:w-6 xs:h-[2px] sm:w-7 sm:h-[3px] bg-[#ffd51e] rounded group-hover:bg-[#FFD700] group-hover:w-4 xs:group-hover:w-5 sm:group-hover:w-6" />
                    <div className="hamburger-line w-4 h-[2px] xs:w-5 xs:h-[2px] sm:w-6 sm:h-[3px] bg-[#ffd51e] rounded ml-auto group-hover:bg-[#FFD700] group-hover:w-3 xs:group-hover:w-4 sm:group-hover:w-5" />
                    <div className="hamburger-line w-3 h-[2px] xs:w-4 xs:h-[2px] sm:w-5 sm:h-[3px] bg-[#ffd51e] rounded group-hover:bg-[#FFD700] group-hover:w-2 xs:group-hover:w-3 sm:group-hover:w-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-[9998] md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          aria-hidden={!isMenuOpen}
        >
          {/* Overlay */}
          <div
            className="mobile-menu-backdrop fixed inset-0 bg-black/70 transition-opacity duration-300 z-[9998]"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden={!isMenuOpen}
          />

          {/* Slide-in Menu */}
          <div
            ref={menuRef}
            className={`fixed inset-y-0 left-0 w-[90%] xs:w-[85%] sm:w-[75%] max-w-xs h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] shadow-2xl transition-all duration-300 ease-out transform z-[9999] border-r-4 border-[#cc0000] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-black/50 to-transparent">
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white font-luxury-serif luxury-nav-spacing">Menu</h2>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-3 xs:px-4 sm:px-5 py-4 xs:py-5 sm:py-6 space-y-1 xs:space-y-2 sm:space-y-3 overflow-y-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 xs:space-x-4 text-base xs:text-lg sm:text-xl font-semibold text-[#ffd51e] hover:bg-gradient-to-r hover:from-[#FFD700]/10 hover:to-transparent hover:text-[#FFD700] transition-all duration-300 px-3 xs:px-4 sm:px-5 py-3 xs:py-4 w-full rounded-lg font-luxury-serif hover:pl-5 xs:hover:pl-6 sm:hover:pl-7 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-[#ffd51e] flex-shrink-0 group-hover:text-[#FFD700] group-hover:scale-110 transition-all duration-300" />
                    <span className="truncate font-medium luxury-nav-spacing">{item.name}</span>
                  </Link>
                ))}

                {/* Auth Actions */}
                <div className="pt-6 xs:pt-8 sm:pt-10 space-y-3 xs:space-y-4">
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="w-full flex items-center justify-center bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-[#ffd51e] hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:text-[#FFD700] transition-all duration-300 rounded-lg px-4 xs:px-5 sm:px-6 py-3 xs:py-4 sm:py-5 font-luxury-serif text-sm xs:text-base sm:text-lg font-semibold luxury-nav-spacing"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Admin Panel</span>
                    </Link>
                  ) : user ? (
                    <Link
                      to="/profile"
                      className="flex items-center justify-center py-3 xs:py-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ffd51e]/20 to-[#ffd51e]/10 flex items-center justify-center border-2 border-[#ffd51e]/40 hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/25">
                        <User className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-[#ffd51e] hover:text-[#FFD700] transition-colors duration-300" />
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center justify-center py-3 xs:py-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ffd51e]/20 to-[#ffd51e]/10 flex items-center justify-center border-2 border-[#ffd51e]/40 hover:bg-gradient-to-br hover:from-[#FFD700]/30 hover:to-[#FFD700]/20 hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/25">
                        <User className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-[#ffd51e] hover:text-[#FFD700] transition-colors duration-300" />
                      </div>
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;