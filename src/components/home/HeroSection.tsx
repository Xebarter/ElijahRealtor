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
        {/* Logo */}
        <img
          src="/logo.svg"
          alt="Elijah Realtor Logo"
          className="mx-auto h-16 sm:h-20 md:h-28 mb-6"
        />

        {/* Headline */}
        <h1 className="text-white font-playfair text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          Your Dream
          <span className="block text-yellow-400">Property Across Africa</span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-200 text-base sm:text-lg md:text-xl mt-4 mb-8 max-w-3xl mx-auto">
          Luxury properties in Africa's most prestigious locations
        </p>

        {/* Search */}
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

        {/* CTA */}
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
          className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:scale-105 transition"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 448 512"
          >
            <path d="M380.9 97.1C339 ... z" />
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
                className="fixed bottom-24 right-6 bg-yellow-400 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition"
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
        <DialogContent className="bg-white p-6 rounded-lg max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Send us a message</DialogTitle>
            <DialogDescription>
              We’ll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <ContactForm />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
