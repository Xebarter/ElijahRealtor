import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Properties', href: '/properties' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
    services: [
      { name: 'Property Sales', href: '/properties' },
      { name: 'Property Management', href: '/services/management' },
      { name: 'Investment Advisory', href: '/services/advisory' },
      { name: 'Property Valuation', href: '/services/valuation' },
    ],
    resources: [
      { name: 'Testimonials', href: '/testimonials' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/elijahrealtor' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/elijahrealtor' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/elijahrealtor' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/elijahrealtor' },
  ];

  const operatingCountries = COUNTRIES.slice(0, 8); // Show first 8 countries

  return (
    <footer className="bg-primary-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-gold rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-navy" />
              </div>
              <span className="text-xl font-bold">ElijahRealtor</span>
            </Link>
            <p className="text-gray-300 mb-6">
              Your trusted partner in finding the perfect property across Africa. We specialize in luxury residential 
              and commercial real estate in multiple countries.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-gold flex-shrink-0" />
                <span className="text-sm text-gray-300">
                  ABC Place, Waiyaki Way, Westlands, Nairobi
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-gold flex-shrink-0" />
                <span className="text-sm text-gray-300">+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-gold flex-shrink-0" />
                <span className="text-sm text-gray-300">info@elijahrealtor.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-gold transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-gold transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating Countries */}
          <div>
            <h3 className="text-lg font-semibold mb-4">We Operate In</h3>
            <div className="grid grid-cols-2 gap-2">
              {operatingCountries.map((country) => (
                <div key={country.code} className="flex items-center text-sm text-gray-300">
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-gold transition-colors duration-200"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-300 text-sm">
              © {currentYear} ElijahRealtor. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Built with ❤️ for exceptional real estate experiences across Africa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;