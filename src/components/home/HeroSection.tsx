import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../../lib/supabase';

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
      if (data) setImages(data.map((d: any) => d.image_url));
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
    <section className="relative bg-gradient-to-br from-primary-navy via-blue-900 to-primary-navy min-h-[60vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Images with Smooth Crossfade */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Current Image - Always visible */}
        {images.length > 0 && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              pointerEvents: 'none'
            }}
          />
        )}
        {/* Next Image - Fades in during transition */}
        {images.length > 1 && (
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-20 transition-opacity ease-in-out ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${images[nextIndex]})`,
              pointerEvents: 'none',
              transitionDuration: `${FADE_DURATION}ms`
            }}
          />
        )}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-30" />
      
      <div className="relative z-40 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 w-full">
        <div className="text-center w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
            Find Your Dream
            <span className="block text-primary-gold mt-2 sm:mt-3">Property Across Africa</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.2s' }}>
            Discover luxury residential and commercial properties in Africa's most prestigious locations
          </p>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row gap-3 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-xl w-full">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                <Input
                  type="text"
                  placeholder="Search locations, countries, or properties..."
                  className="pl-10 sm:pl-12 border-0 focus:ring-2 focus:ring-primary-gold text-sm sm:text-base w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="btn-primary px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto">
                Search
              </Button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up w-full px-2 sm:px-0" style={{ animationDelay: '0.6s' }}>
            <Link to="/properties" className="w-full sm:w-auto">
              <Button size="lg" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base w-full">
                Browse All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50 hidden sm:block">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;