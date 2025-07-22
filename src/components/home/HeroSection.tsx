import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../../lib/supabase';

const SLIDE_DURATION = 8000;
const FADE_DURATION = 2000;

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [nextIndex, setNextIndex] = React.useState(1);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from('hero_images')
        .select('image_url')
        .order('order', { ascending: true });
      if (data) {
        setImages(data.map((d: any) => d.image_url));
      } else {
        setImages([
          "https://placehold.co/1920x1080/0A1931/E0B46B?text=Luxury+Property+1",
          "https://placehold.co/1920x1080/1A2B4C/F0C57C?text=Luxury+Property+2",
          "https://placehold.co/1920x1080/2A3C5D/D0A35A?text=Luxury+Property+3",
        ]);
      }
    };
    fetchImages();
  }, []);

  React.useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        setIsTransitioning(false);
      }, FADE_DURATION);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [nextIndex, images.length]);

  React.useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [images]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/256751077770`, '_blank');
  };

  return (
    <section className="relative min-h-[60vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden font-inter overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Playfair+Display:wght@700;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .font-luxury {
          font-family: 'Playfair Display', serif;
        }
        .gold-gradient {
          color: #FFD700; /* Brighter, more vibrant gold */
        }
        .gold-shimmer {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          background: url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23E0B46B" stop-opacity="0.15"/><stop offset="1" stop-color="%23D4AF37" stop-opacity="0.08"/></linearGradient><rect width="100%25" height="100%25" fill="url(%23g)"/></svg>');
          z-index: 25;
        }
        .sparkle {
          position: absolute;
          width: 2px; height: 2px;
          border-radius: 50%;
          background: #fffbe6;
          opacity: 0.7;
          animation: sparkle 2.5s infinite linear;
        }
        @keyframes sparkle {
          0% { opacity: 0.7; }
          50% { opacity: 1; box-shadow: 0 0 8px 2px #fffbe6; }
          100% { opacity: 0.7; }
        }
        .btn-primary {
          background: linear-gradient(135deg, #E0B46B 0%, #D4AF37 100%);
          color: #181818;
          font-weight: 700;
          box-shadow: 0 4px 24px 0 #E0B46B55, 0 2px 8px #0002;
          border: none;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          left: -75%;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.0) 100%);
          transform: skewX(-20deg);
          transition: left 0.5s;
        }
        .btn-primary:hover::after {
          left: 120%;
          transition: left 0.5s;
        }
        .input-focus-gold:focus {
          border-color: #E0B46B !important;
          box-shadow: 0 0 0 3px #E0B46B88 !important;
        }
        .whatsapp-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 100;
          background: #25D366;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
          transition: all 0.3s ease;
        }
        .whatsapp-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(37, 211, 102, 0.4);
        }
        .search-container {
          display: flex;
          justify-content: center;
          margin: 0 auto;
          width: 100%;
          max-width: 48rem;
        }
        .search-form {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .search-input-container {
          display: flex;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 640px) {
          .font-luxury {
            font-size: 3rem !important;
          }
          .hero-headline {
            font-size: 3rem !important;
            line-height: 3.5rem !important;
          }
          .hero-subheadline {
            font-size: 1.5rem !important;
          }
          .hero-crest {
            width: 48px !important;
            height: 48px !important;
            margin-bottom: 0.75rem !important;
          }
        }
        @media (min-width: 641px) {
          .search-container {
            width: 100%;
            max-width: 600px;
          }
          .search-input-container {
            width: 100%;
          }
          .search-input {
            display: block;
            width: 100%;
            opacity: 1;
            margin-left: 0;
          }
          .search-toggle {
            display: none;
          }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: '#000000' }}>
        {/* Gold shimmer overlay */}
        <div className="gold-shimmer" />
        {/* Sparkles */}
        <div className="sparkle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
        <div className="sparkle" style={{ top: '60%', left: '80%', animationDelay: '1.2s' }} />
        <div className="sparkle" style={{ top: '40%', left: '50%', animationDelay: '2s' }} />
        <div className="sparkle" style={{ top: '75%', left: '30%', animationDelay: '0.8s' }} />
        {/* Current Image */}
        {images.length > 0 && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              pointerEvents: 'none',
              opacity: isTransitioning ? 0 : 1,
              transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            }}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-30" />

      <div className="relative z-40 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="text-center w-full">
          {/* Crest */}
          <div className="flex justify-center mb-4">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-crest">
              <circle cx="32" cy="32" r="30" stroke="#E0B46B" strokeWidth="4" fill="#181818" />
              <path d="M32 16L36 28H28L32 16Z" fill="#E0B46B" />
              <path d="M32 48C38 48 44 44 44 36C44 32 40 28 32 28C24 28 20 32 20 36C20 44 26 48 32 48Z" fill="#E0B46B" />
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 sm:mb-6 md:mb-8 tracking-tight text-shadow-lg font-luxury hero-headline">
            Your Dream
            <span className="block gold-gradient mt-2 font-luxury">Property Across Africa</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto px-2 sm:px-0 leading-relaxed font-inter hero-subheadline">
            Luxury properties in Africa's most prestigious locations
          </p>

          {/* Search */}
          <div className="flex justify-center mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0">
            <div className="search-container w-full max-w-3xl">
              <form onSubmit={handleSearch} className="search-form bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl overflow-hidden w-full">
                <div className="search-input-container flex items-center w-full h-full pl-6 pr-2 py-1.5">
                  <Input
                    type="text"
                    placeholder="Search locations, countries, or properties..."
                    className="search-input w-full border-0 focus:ring-0 text-white bg-transparent placeholder-gray-300 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="search-button btn-primary p-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex-shrink-0"
                  >
                    <Search className="w-6 h-6" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Call-to-action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-2 sm:px-0">
            <Link to="/properties" className="w-full sm:w-auto">
              <Button size="lg" className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
                Browse All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50 hidden sm:block">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-4 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* WhatsApp button */}
      <button
        onClick={openWhatsApp}
        className="whatsapp-button"
        aria-label="Chat with us on WhatsApp"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 448 512"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.5-7c-18.9-29.4-28.8-63.3-28.8-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSection;