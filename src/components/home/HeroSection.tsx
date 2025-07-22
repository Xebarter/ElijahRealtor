import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
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
  const [searchExpanded, setSearchExpanded] = React.useState(false);

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

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 300);
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
          background: linear-gradient(90deg, #E0B46B 0%, #D4AF37 50%, #fffbe6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
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
        .gold-vignette {
          box-shadow: 0 0 120px 40px #E0B46B33 inset;
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
        .search-toggle {
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .search-toggle:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.2);
        }
        .search-container {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          justify-content: center;
          margin: 0 auto;
        }
        .search-form {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .search-input-container {
          transition: width 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          align-items: center;
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
          .search-container {
            width: ${searchExpanded ? '100%' : 'auto'};
          }
          .search-input-container {
            width: ${searchExpanded ? '100%' : '0'};
          }
          .search-input {
            display: ${searchExpanded ? 'block' : 'none'};
            width: ${searchExpanded ? '100%' : '0'};
            opacity: ${searchExpanded ? '1' : '0'};
            margin-left: ${searchExpanded ? '0.5rem' : '0'};
          }
          .search-button {
            display: ${searchExpanded ? 'block' : 'none'};
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
            margin-left: 0.5rem;
          }
          .search-toggle {
            display: none;
          }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #181818 100%)' }}>
        <div className="gold-shimmer" />
        <div className="sparkle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
        <div className="sparkle" style={{ top: '60%', left: '80%', animationDelay: '1.2s' }} />
        <div className="sparkle" style={{ top: '40%', left: '50%', animationDelay: '2s' }} />
        <div className="sparkle" style={{ top: '75%', left: '30%', animationDelay: '0.8s' }} />
        {images.length > 0 && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10"
            style={{ backgroundImage: `url(${images[currentIndex]})`, pointerEvents: 'none' }}
          />
        )}
        {images.length > 1 && (
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-20 transition-opacity ease-in-out ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${images[nextIndex]})`,
              pointerEvents: 'none',
              transitionDuration: `${FADE_DURATION}ms`,
            }}
          />
        )}
      </div>

      {/* Black overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50 z-30 gold-vignette" />

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
            <div className="search-container">
              {!searchExpanded && (
                <button 
                  onClick={toggleSearch}
                  className="search-toggle p-4 rounded-full flex items-center justify-center"
                  aria-label="Open search"
                >
                  <Search className="text-primary-gold w-6 h-6" />
                </button>
              )}
              
              <form onSubmit={handleSearch} className="search-form bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="search-input-container h-full p-2">
                  <Input
                    type="text"
                    placeholder="Search locations, countries, or properties..."
                    className="search-input pl-4 border border-white/30 focus:border-primary-gold focus:ring-primary-gold text-white bg-white/5 placeholder-gray-300 text-lg rounded-xl input-focus-gold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    className="search-button ml-2 btn-primary px-6 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
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
        <MessageCircle className="text-white w-8 h-8" />
      </button>
    </section>
  );
};

export default HeroSection;