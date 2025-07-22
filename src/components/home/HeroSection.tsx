import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../../lib/supabase'; // Assuming supabase is correctly configured.

const SLIDE_DURATION = 8000; // ms (time each image is shown)
const FADE_DURATION = 2000; // ms (duration of fade transition)

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [nextIndex, setNextIndex] = React.useState(1);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    // Fetch hero images from Supabase
    const fetchImages = async () => {
      const { data } = await supabase
        .from('hero_images')
        .select('image_url')
        .order('order', { ascending: true });
      if (data) {
        setImages(data.map((d: any) => d.image_url));
      } else {
        // Fallback images if Supabase fetch fails or returns no data
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

  // Preload images
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

  return (
    <section className="relative min-h-[60vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden font-inter overflow-x-hidden">
      {/* Custom Tailwind CSS for luxurious look */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

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
        /* Responsive overrides */
        @media (max-width: 640px) {
          .font-luxury { font-size: 2rem !important; }
          .hero-headline { font-size: 2rem !important; line-height: 2.4rem !important; }
          .hero-subheadline { font-size: 1.1rem !important; }
          .hero-crest { width: 40px !important; height: 40px !important; margin-bottom: 0.5rem !important; }
          .hero-search { padding: 0.75rem !important; }
          .hero-search-btn { padding: 0.75rem 1.25rem !important; font-size: 1rem !important; }
        }
      `}</style>

      {/* Background Images with Smooth Crossfade */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #181818 0%, #23272e 100%)' }}>
        {/* Gold shimmer overlay */}
        <div className="gold-shimmer" />
        {/* Sparkles */}
        <div className="sparkle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
        <div className="sparkle" style={{ top: '60%', left: '80%', animationDelay: '1.2s' }} />
        <div className="sparkle" style={{ top: '40%', left: '50%', animationDelay: '2s' }} />
        <div className="sparkle" style={{ top: '75%', left: '30%', animationDelay: '0.8s' }} />
        {/* Current Image - Always visible */}
        {images.length > 0 && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10 animate-scale-in-subtle"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Next Image - Fades in during transition */}
        {images.length > 1 && (
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-20 transition-opacity ease-in-out ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            } animate-scale-in-subtle`}
            style={{
              backgroundImage: `url(${images[nextIndex]})`,
              pointerEvents: 'none',
              transitionDuration: `${FADE_DURATION}ms`,
            }}
          />
        )}
      </div>

      {/* Overlay - Black with gold vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-30 gold-vignette" />

      <div className="relative z-40 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 w-full">
        <div className="text-center w-full">
          {/* Luxury Crest SVG */}
          <div className="flex justify-center mb-4 animate-fade-in-up">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="#E0B46B" strokeWidth="4" fill="#181818" />
              <path d="M32 16L36 28H28L32 16Z" fill="#E0B46B" />
              <path d="M32 48C38 48 44 44 44 36C44 32 40 28 32 28C24 28 20 32 20 36C20 44 26 48 32 48Z" fill="#E0B46B" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 md:mb-8 animate-fade-in-up tracking-tight text-shadow-lg font-luxury">
            Your Dream
            <span className="block gold-gradient mt-2 sm:mt-3 font-luxury">Property Across Africa</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto animate-fade-in-up px-2 sm:px-0 leading-relaxed font-inter" style={{ animationDelay: '0.2s' }}>
            Luxury properties in Africa's most prestigious locations
          </p>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row gap-4 bg-white/10 backdrop-blur-2xl p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/20 w-full" style={{ boxShadow: '0 8px 32px 0 #E0B46B22, 0 1.5px 8px #0002' }}>
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-gold w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Search locations, countries, or properties..."
                  className="pl-12 sm:pl-14 border border-white/30 focus:border-primary-gold focus:ring-primary-gold text-white bg-white/5 placeholder-gray-300 text-base sm:text-lg rounded-xl w-full input-focus-gold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
                Search
              </Button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up w-full px-2 sm:px-0" style={{ animationDelay: '0.6s' }}>
            <Link to="/properties" className="w-full sm:w-auto">
              <Button size="lg" className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
                Browse All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50 hidden sm:block">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-4 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;