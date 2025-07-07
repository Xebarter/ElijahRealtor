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
      const { data, error } = await supabase
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
    <section className="relative bg-gradient-to-br from-primary-navy via-blue-900 to-primary-navy min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Images with Smooth Crossfade */}
      <div className="absolute inset-0 w-full h-full">
        {/* Current Image - Always visible */}
        {images.length > 0 && (
          <img
            src={images[currentIndex]}
            alt="Hero background"
            className="w-full h-full object-cover absolute inset-0 z-10"
            style={{ pointerEvents: 'none' }}
            loading="eager"
          />
        )}
        
        {/* Next Image - Fades in during transition */}
        {images.length > 1 && (
          <img
            src={images[nextIndex]}
            alt="Hero background"
            className={`w-full h-full object-cover absolute inset-0 z-20 transition-opacity duration-[${FADE_DURATION}ms] ease-in-out ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ pointerEvents: 'none' }}
            loading="eager"
          />
        )}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-30" />
      
      <div className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            Find Your Dream
            <span className="block text-primary-gold">Property Across Africa</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover luxury residential and commercial properties in Africa's most prestigious locations across multiple countries
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row gap-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by location, country, property type, or price range..."
                  className="pl-10 border-0 focus:ring-2 focus:ring-primary-gold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="btn-primary px-8">
                Search Properties
              </Button>
            </div>
          </form>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link to="/properties">
              <Button size="lg" className="btn-secondary px-8 py-3 text-lg">
                Browse All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;