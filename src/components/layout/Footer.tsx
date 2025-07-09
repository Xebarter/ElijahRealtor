import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Instagram } from 'lucide-react';
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
      { name: 'Property Sales', href: '/about#sales' },
      { name: 'Property Management', href: '/about#management' },
      { name: 'Investment Advisory', href: '/about#advisory' },
      { name: 'Property Valuation', href: '/about#valuation' },
    ],
    resources: [
      { name: 'Testimonials', href: '/testimonials' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/elijah_realtor_pro/' },
    { name: 'TikTok', icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ), href: 'https://www.tiktok.com/@elijahrealtorpro' },
    { name: 'WhatsApp', icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ), href: 'https://wa.me/256751077770' },
  ];

  const operatingCountries = COUNTRIES.slice(0, 8); // Show first 8 countries

  return (
    <footer className="bg-primary-navy text-white">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1 mb-6 lg:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-3 sm:mb-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-gold rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary-navy" />
              </div>
              <span className="text-lg sm:text-xl font-bold truncate">ElijahRealtor</span>
            </Link>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Your trusted partner in finding the perfect property across Africa. We specialize in luxury residential 
              and commercial real estate in multiple countries.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-gold flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">
                  Mutungo Hill, Kampala
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-gold flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">+256 751 077770</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-gold flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">lwangabluhan@yahoo.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1 sm:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-gold transition-colors duration-200 text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-1 sm:space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-gold transition-colors duration-200 text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating Countries */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">We Operate In</h3>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {operatingCountries.map((country) => (
                <div key={country.code} className="flex items-center text-xs sm:text-sm text-gray-300">
                  <span className="mr-1 sm:mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 sm:space-x-6 mb-4 md:mb-0">
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
            <p className="text-gray-300 text-xs sm:text-sm">
              © {currentYear} ElijahRealtor. All rights reserved.
            </p>
            <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
              Built with ❤️ for exceptional real estate experiences across Africa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;