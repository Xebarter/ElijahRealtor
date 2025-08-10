import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
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
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from('hero_images')
        .select('image_url')
        .order('order', { ascending: true });
      if (data?.length) {
        setImages(data.map((d: any) => d.image_url));
      } else {
        setImages([
          'https://placehold.co/1920x1080/0A1931/E0B46B?text=Luxury+Property+1',
          'https://placehold.co/1920x1080/1A2B4C/F0C57C?text=Luxury+Property+2',
          'https://placehold.co/1920x1080/2A3C5D/D0A35A?text=Luxury+Property+3',
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
    <section className="relative h-screen flex items-center justify-center overflow-hidden font-inter">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        {images.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[6500ms]"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              opacity: isTransitioning ? 0 : 1,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-screen-2xl px-4 md:px-8 text-center">
        <img
          src="/logo.svg"
          alt="Elijah Realtor Logo"
          className="mx-auto h-16 sm:h-20 md:h-28 mb-6"
        />

        <h1 className="text-white font-playfair text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          Your Dream
          <span className="block text-yellow-400">Property Across Africa</span>
        </h1>

        <p className="text-gray-200 text-base sm:text-lg md:text-xl mt-4 mb-8 max-w-3xl mx-auto">
          Luxury properties in Africa's most prestigious locations
        </p>

        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg max-w-lg mx-auto px-2"
        >
          <Input
            type="text"
            placeholder="Search locations, countries, or properties..."
            className="flex-1 border-0 bg-transparent text-white placeholder-gray-300 focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            className="bg-yellow-400 text-black rounded-full hover:bg-yellow-500 transition"
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>

        <div className="mt-8">
          <Link to="/properties">
            <Button
              size="lg"
              className="border-2 border-yellow-400 text-yellow-400 bg-transparent rounded-full px-6 py-3 hover:bg-yellow-400 hover:text-black transition"
            >
              View All Properties
            </Button>
          </Link>
        </div>
      </div>

      {/* WhatsApp Button */}
      {!open && (
        <button
          onClick={openWhatsApp}
          className="fixed bottom-6 right-6 z-[9999] bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:scale-105 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}>
            <g>
              <circle cx="18" cy="18" r="16" fill="#25D366"/>
              <path d="M18 8.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.33 1.28 4.76L8.5 27.5l4.85-1.26A9.44 9.44 0 0 0 18 27.5c5.25 0 9.5-4.25 9.5-9.5S23.25 8.5 18 8.5zm0 17.1c-1.49 0-2.95-.39-4.22-1.13l-.3-.18-2.88.75.77-2.8-.19-.29A7.56 7.56 0 0 1 10.5 18c0-4.13 3.37-7.5 7.5-7.5s7.5 3.37 7.5 7.5-3.37 7.5-7.5 7.5zm4.09-5.65c-.22-.11-1.32-.65-1.52-.73-.2-.07-.34-.11-.48.11-.14.22-.55.73-.67.88-.12.15-.25.17-.47.06-.22-.11-.92-.34-1.74-1.09-.64-.57-1.07-1.28-1.2-1.5-.13-.22-.01-.33.1-.44.11-.11.22-.28.33-.42.11-.14.14-.24.22-.4.07-.15.04-.28-.02-.39-.06-.11-.48-1.16-.66-1.59-.17-.43-.35-.37-.48-.38-.12-.01-.27-.01-.42-.01-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.89 0 1.11.81 2.18.92 2.33.11.15 1.6 2.56 3.89 3.5.54.23.96.36 1.29.46.54.17 1.03.15 1.42.09.43-.06 1.32-.54 1.5-1.07.18-.53.18-.98.13-1.07-.05-.09-.2-.15-.42-.26z" fill="#fff"/>
            </g>
          </svg>
          <span className="hidden sm:inline">Let's Chat</span>
        </button>
      )}

      {/* Message Button */}
      {!open && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-6 z-[9999] bg-yellow-400 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send us a message</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Contact Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white rounded-lg w-full max-w-md mx-auto p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send us a message</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              We’ll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ContactForm />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
