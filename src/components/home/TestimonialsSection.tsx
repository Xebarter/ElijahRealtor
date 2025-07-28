import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTestimonials } from '@/hooks/useTestimonials';

const TestimonialsSection = () => {
  const { testimonials, loading, error } = useTestimonials('approved', 3);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-primary-gold fill-current' : 'text-gray-300'}`}
      />
    ));

  if (loading) {
    return (
      <section className="py-16 bg-[#fefefe] text-[#1a1a1a] font-[Cinzel]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials?.length) return null;

  return (
    <section className="py-10 sm:py-16 bg-[#fefefe] text-[#1a1a1a] font-[Cinzel]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#555] max-w-2xl mx-auto">
            Don’t just take our word for it — hear from our satisfied clients.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-14">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="bg-white border border-[#e8e8e8] shadow-lg hover:shadow-xl transition duration-300 animate-fade-in-up rounded-2xl"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-7 h-7 text-primary-gold/30" />
                  <div className="flex space-x-1">{renderStars(testimonial.rating)}</div>
                </div>

                <p className="text-[#666] italic leading-relaxed mb-6 text-sm sm:text-base">
                  “{testimonial.content}”
                </p>

                <div className="flex items-center">
                  {testimonial.client_image_url ? (
                    <img
                      src={testimonial.client_image_url}
                      alt={testimonial.client_name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-4 border border-primary-gold"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-gold/10 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary-gold font-semibold text-base sm:text-lg">
                        {testimonial.client_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-[#1a1a1a] text-sm sm:text-base">
                      {testimonial.client_name}
                    </div>
                    <div className="text-xs sm:text-sm text-[#777]">Verified Client</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Button */}
        <div className="text-center">
          <Link to="/testimonials">
            <Button
              size="lg"
              className="bg-[#151f28] text-[#ffd51e] hover:bg-[#122330] hover:text-[#ffd51e] transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto border border-red-500 hover:border-red-600 rounded-lg"
            >
              View All Testimonials
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
