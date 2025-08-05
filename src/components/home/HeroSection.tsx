import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../../lib/supabase';
import ContactForm from '@/components/common/ContactForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const SLIDE_DURATION = 7000;
const FADE_DURATION = 6500;

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

  // Modal state for message button
  const [open, setOpen] = React.useState(false);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden font-inter overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
        
        .font-luxury {
          font-family: 'Playfair Display', serif;
          letter-spacing: 0.02em;
          line-height: 1.15;
        }
        
        .font-luxury-serif {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.08em;
          line-height: 1.4;
        }
        
        .luxury-spacing {
          letter-spacing: 0.15em;
          line-height: 1.6;
        }
        
        .gold-gradient {
          color: #FFD700;
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }
        
        .gold-shimmer {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          background: url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23FFD700" stop-opacity="0.15"/><stop offset="1" stop-color="%23FFD700" stop-opacity="0.08"/></linearGradient><rect width="100%25" height="100%25" fill="url(%23g)"/></svg>');
          z-index: 25;
        }
        
        .sparkle {
          position: absolute;
          width: 2px; height: 2px;
          border-radius: 50%;
          background: #FFD700;
          opacity: 0.7;
          animation: sparkle 2.5s infinite linear;
        }
        
        @keyframes sparkle {
          0% { opacity: 0.7; }
          50% { opacity: 1; box-shadow: 0 0 8px 2px #FFD700; }
          100% { opacity: 0.7; }
        }
        
        .btn-primary {
          background-color: #FFD700;
          color: #181818;
          font-weight: 700;
          box-shadow: 0 4px 24px 0 #FFD70055, 0 2px 8px #0002;
          border: none;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.05em;
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
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px #FFD70088 !important;
        }
        
        .btn-secondary {
          background-color: transparent;
          border: 2px solid #FFD700;
          color: #FFD700;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        
        .btn-secondary:hover {
          background-color: #FFD700;
          color: #181818;
        }
        
        .whatsapp-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 100;
          background: #25D366;
          padding: 12px 24px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
          transition: all 0.3s ease;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          line-height: 1.5;
          letter-spacing: 0.03em;
        }
        
        .whatsapp-button:hover {
          transform: scale(1.05);
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
        
        .luxury-headline {
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 0.95;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }
        
        .luxury-subtext {
          letter-spacing: 0.05em;
          line-height: 1.7;
          font-weight: 400;
        }
        
        @media (max-width: 640px) {
          .font-luxury {
            font-size: 2.5rem !important;
            letter-spacing: 0.01em;
          }
          .hero-headline {
            font-size: 2.5rem !important;
            line-height: 0.9 !important;
            letter-spacing: -0.01em;
          }
          .hero-subheadline {
            font-size: 1.125rem !important;
            letter-spacing: 0.03em;
            line-height: 1.6;
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
        
        @media (min-width: 768px) {
          .luxury-headline {
            letter-spacing: -0.03em;
          }
          .luxury-subtext {
            letter-spacing: 0.08em;
            line-height: 1.8;
          }
        }
        
        @media (min-width: 1024px) {
          .luxury-headline {
            letter-spacing: -0.04em;
          }
          .luxury-subtext {
            letter-spacing: 0.1em;
            line-height: 1.9;
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/65 to-black/45 z-30" />

      <div className="relative z-40 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="text-center w-full">
          {/* Crest */}
          <div className="hidden md:flex justify-center mb-6 md:mb-8 ipad:mb-10">
            <img src="/logo.svg" alt="Elijah Realtor Logo" className="h-16 sm:h-20 ipad:h-24 w-auto hero-crest opacity-90" />
          </div>

          {/* Headline */}
          <h1 className="font-luxury luxury-headline text-white mb-6 sm:mb-8 md:mb-10 ipad:mb-12 tracking-tight text-shadow-lg hero-headline
            text-4xl xs:text-5xl sm:text-6xl md:text-7xl ipad:text-8xl ipad-lg:text-9xl lg:text-9xl
            leading-none sm:leading-none md:leading-[0.9]"
          >
            Your Dream
            <span className="block gold-gradient mt-3 sm:mt-4 md:mt-6 font-luxury
              text-3xl xs:text-4xl sm:text-5xl md:text-6xl ipad:text-7xl ipad-lg:text-8xl lg:text-8xl
            ">
              Property Across Africa
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-luxury-serif luxury-subtext text-lg xs:text-xl sm:text-2xl md:text-3xl ipad:text-4xl ipad-lg:text-5xl lg:text-5xl text-gray-100 mb-8 sm:mb-10 md:mb-12 ipad:mb-14 max-w-4xl ipad:max-w-5xl mx-auto px-2 sm:px-0 hero-subheadline"
          >
            Luxury properties in Africa's most prestigious locations
          </p>

          {/* Search */}
          <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 ipad:mb-14 px-2 sm:px-0">
            <div className="w-full max-w-[95vw] xs:max-w-xl sm:max-w-2xl md:max-w-3xl ipad:max-w-4xl">
              <form onSubmit={handleSearch} className="flex bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl overflow-hidden w-full">
                <div className="flex items-center w-full h-full pl-6 xs:pl-8 pr-3 py-2 xs:py-3">
                  <Input
                    type="text"
                    placeholder="Search locations, countries, or properties..."
                    className="w-full border-0 focus:ring-0 text-white bg-transparent placeholder-gray-300 text-lg xs:text-xl ipad:text-2xl font-luxury-serif luxury-spacing"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="btn-primary p-3 xs:p-4 ipad:p-5 text-lg xs:text-xl ipad:text-2xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex-shrink-0"
                  >
                    <Search className="w-6 h-6 xs:w-7 xs:h-7 ipad:w-8 ipad:h-8" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Call-to-action */}
          <div className="flex flex-col xs:flex-row gap-4 xs:gap-6 justify-center items-center w-full px-2 sm:px-0">
            <Link to="/properties" className="w-full xs:w-auto">
              <Button size="lg" className="btn-secondary font-luxury-serif px-8 xs:px-10 sm:px-12 py-4 xs:py-5 sm:py-6 text-lg xs:text-xl ipad:text-2xl rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-50 hidden sm:block">
        <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-4 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* WhatsApp button */}
      {!open && (
        <button
          onClick={openWhatsApp}
          className="whatsapp-button font-luxury-serif"
          aria-label="Chat with us on WhatsApp"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 448 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white mr-3"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.5-7c-18.9-29.4-28.8-63.3-28.8-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
          <span>Let's Chat</span>
        </button>
      )}
      
      {/* Message button */}
      {!open && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setOpen(true)}
                className="fixed bottom-36 right-8 z-[101] bg-[#FFD700] hover:bg-yellow-400 text-[#181818] w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
                aria-label="Send us a message"
                style={{ boxShadow: '0 4px 20px #FFD70055, 0 2px 8px #0002' }}
              >
                <MessageCircle className="w-8 h-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-luxury-serif luxury-spacing">Send us a message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Message Form */}
      {open && (
        <div className="fixed inset-0" style={{ zIndex: 10000 }}>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            style={{ zIndex: 10001 }}
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-0 flex items-start justify-center pt-20"
            style={{ zIndex: 10002, pointerEvents: 'none' }}
          >
            <div 
              className="relative bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[calc(100vh-10rem)] overflow-y-auto"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 font-luxury-serif luxury-spacing">Send us a Message</h2>
              <p className="text-gray-700 mb-6 font-luxury-serif luxury-spacing leading-relaxed">
                Please fill out the form below and we will get back to you as soon as possible.
              </p>
              <ContactForm onSuccess={() => setOpen(false)} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="absolute top-4 right-4 text-white bg-black p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                style={{ zIndex: 10003 }}
                aria-label="Close message form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;