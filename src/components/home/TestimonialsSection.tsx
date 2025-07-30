import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTestimonials } from '@/hooks/useTestimonials';
import { useState, useEffect } from 'react';

const TestimonialsSection = () => {
  const { testimonials, loading, error } = useTestimonials('approved', 6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const itemsPerPage = 3;

  useEffect(() => {
    if (!isHovered && testimonials.length > itemsPerPage) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= Math.ceil(testimonials.length / itemsPerPage) - 1 ? 0 : prevIndex + 1
        );
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isHovered]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-[#ffd51e] fill-current' : 'text-gray-200'}`}
      />
    ));

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= Math.ceil(testimonials.length / itemsPerPage) - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? Math.ceil(testimonials.length / itemsPerPage) - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#faf8f5] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials?.length) return null;

  const visibleTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex * itemsPerPage) + itemsPerPage
  );
  
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#faf8f5] to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/testimonial-bg-pattern.png')] opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-sm font-medium text-[#ffd51e] uppercase tracking-widest mb-2 inline-block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 font-cinzel">
            What Our Clients Say
          </h2>
          <div className="w-20 h-1 bg-[#ffd51e] mx-auto mb-6"></div>
          <p className="text-base sm:text-lg text-[#555] max-w-2xl mx-auto">
            Don't just take our word for it — hear from our satisfied clients about their experience.
          </p>
        </div>

        {/* Navigation Arrows */}
        {testimonials.length > itemsPerPage && (
          <>
            <button 
              onClick={prevSlide}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-[#ffd51e] hover:bg-[#ffd51e] hover:text-white transition-all duration-300 border border-[#ffd51e]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-[#ffd51e] hover:bg-[#ffd51e] hover:text-white transition-all duration-300 border border-[#ffd51e]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Testimonials Carousel */}
        <div 
          className="relative mb-10 sm:mb-16 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="transition-transform duration-500 ease-in-out flex"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl h-full">
                  <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <Quote className="w-8 h-8 text-[#ffd51e]/20" />
                      <div className="flex">{renderStars(testimonial.rating)}</div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base flex-grow italic">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center pt-4 border-t border-gray-100">
                      {testimonial.client_image_url ? (
                        <img
                          src={testimonial.client_image_url}
                          alt={testimonial.client_name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-4 border-2 border-[#ffd51e] p-0.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffd51e]/10 rounded-full flex items-center justify-center mr-4 border-2 border-[#ffd51e] p-0.5">
                          <span className="text-[#ffd51e] font-semibold text-xl">
                            {testimonial.client_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-base sm:text-lg">
                          {testimonial.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.client_position || 'Happy Client'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mb-10 sm:mb-12">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-[#ffd51e] w-6' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center">
          <Link to="/testimonials">
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-[#ffd51e] text-[#1a1a1a] hover:bg-[#ffd51e] hover:text-white hover:border-[#ffd51e] transition-all duration-300 px-8 py-6 rounded-lg font-medium group"
            >
              Read More Success Stories
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
