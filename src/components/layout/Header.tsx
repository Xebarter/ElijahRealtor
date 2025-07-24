import { Link } from 'react-router-dom';
import { Menu, X, Home, Building, Phone, BookOpen, LogIn, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useState, useRef } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuthStore();

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
            <span className="text-2xl font-bold tracking-wider text-[#ffd51e]">ElijahRealtor</span>
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
            {isAdmin ? (
              <Link to="/admin">
                <Button className="btn-primary bg-primary-gold hover:bg-primary-gold/90 text-primary-navy font-bold tracking-wide font-cinzel">
                  Admin
                </Button>
              </Link>
            ) : user ? (
              <span className="text-sm text-gray-300">Welcome, {user.user_metadata?.full_name || user.email}</span>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-primary-navy font-bold tracking-wide font-cinzel">
                  <LogIn className="w-5 h-5 mr-2" />
                  Admin Login
                </Button>
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
        ></div>

        {/* Menu Panel */}
        <div
          ref={menuRef}
          className={`fixed top-4 right-4 h-auto max-h-[90vh] w-4/5 max-w-sm bg-black shadow-2xl transition-transform duration-300 ease-in-out border-2 border-[#ffd51e] rounded-lg ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-white hover:bg-white/10">
              <X className="w-8 h-8" />
            </Button>
          </div>
          <nav className="flex flex-col items-start p-6 pt-0 space-y-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-4 text-lg font-semibold text-white hover:text-primary-gold transition-colors duration-300 font-cinzel"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-6 w-full">
              {isAdmin ? (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full btn-primary bg-primary-gold hover:bg-primary-gold/90 text-primary-navy font-bold tracking-wide text-lg py-3 font-cinzel">Admin</Button>
                </Link>
              ) : !user ? (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-primary-navy font-bold tracking-wide text-lg py-3 font-cinzel">
                    <LogIn className="w-5 h-5 mr-2" />
                    <span>Admin Login</span>
                  </Button>
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
