import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, MessageSquare, Users, Heart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useTestimonials } from '@/hooks/useTestimonials';
import { COUNTRIES } from '@/lib/countries';

const Testimonials = () => {
  const { testimonials, loading, error } = useTestimonials('approved');
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  const filteredTestimonials = testimonials.filter(testimonial => 
    selectedType === 'all' || testimonial.type === selectedType
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-primary-gold fill-current' : 'text-primary-gold/50'
        }`}
      />
    ));
  };

  const getCountryFlag = (country: string) => {
    const countryData = COUNTRIES.find(c => c.name === country);
    return countryData?.flag || '🌍';
  };

  const renderTestimonialMedia = (testimonial: any) => {
    if (testimonial.type === 'video' && testimonial.media_urls?.length > 0) {
      const videoUrl = testimonial.media_urls[0];
      
      // Check if it's a YouTube or Vimeo URL
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        );
      } else if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.match(/vimeo\.com\/([^&\n?#]+)/)?.[1];
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
            />
          </div>
        );
      }
    } else if (testimonial.type === 'image' && testimonial.media_urls?.length > 0) {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={testimonial.media_urls[0]}
            alt="Testimonial image"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading testimonials</div>;

  const stats = {
    all: testimonials.length,
    text: testimonials.filter(t => t.type === 'text').length,
    image: testimonials.filter(t => t.type === 'image').length,
    video: testimonials.filter(t => t.type === 'video').length
  };

  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0;

  return (
    <>
      <SEO title="Testimonials" description="Read what our clients say about their experience with ElijahRealtor" />
      <div className="bg-white text-[#1a1a1a] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-[#1a1a1a] mb-6 sm:mb-8">
            What Our Clients Say
          </h1>
          <p className="text-xl text-center text-[#555] mb-8 sm:mb-12 max-w-3xl mx-auto">
            Discover why our clients trust us with their property needs. Read their stories and see how we've helped them achieve their real estate goals.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-gold mb-1">{stats.all}</div>
              <div className="text-sm text-[#555]">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-gold mb-1">{averageRating}</div>
              <div className="text-sm text-[#555]">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-gold mb-1">98%</div>
              <div className="text-sm text-[#555]">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-gold mb-1">8</div>
              <div className="text-sm text-[#555]">Countries</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-md mx-auto bg-white border border-[#e8e8e8]">
              <TabsTrigger value="all" className="flex items-center text-[#555] data-[state=active]:bg-primary-gold data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-1" />
                All ({stats.all})
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center text-[#555] data-[state=active]:bg-primary-gold data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-1" />
                Text ({stats.text})
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center text-[#555] data-[state=active]:bg-primary-gold data-[state=active]:text-white">
                <Heart className="w-4 h-4 mr-1" />
                Photos ({stats.image})
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center text-[#555] data-[state=active]:bg-primary-gold data-[state=active]:text-white">
                <Play className="w-4 h-4 mr-1" />
                Videos ({stats.video})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-8 sm:mb-12">
            {filteredTestimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="testimonial-card animate-fade-in-up h-full bg-white border border-[#e8e8e8] shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  if (testimonial.media_urls?.length > 0) {
                    setSelectedMedia(testimonial.media_urls[0]);
                    setShowMediaDialog(true);
                  }
                }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="w-8 h-8 text-primary-gold/30" />
                    <div className="flex space-x-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  {renderTestimonialMedia(testimonial)}

                  <div className="flex-1">
                    <p className="text-[#666] mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center mr-4">
                        <span className="text-primary-gold font-semibold">
                          {testimonial.client_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-[#1a1a1a]">
                          {testimonial.client_name}
                        </div>
                        {testimonial.client_title && (
                          <div className="text-sm text-[#555]">
                            {testimonial.client_title}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {testimonial.country && (
                      <div className="flex items-center">
                        <span className="text-lg mr-1">{getCountryFlag(testimonial.country)}</span>
                        <span className="text-sm text-[#555]">{testimonial.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Badge variant="outline" className="capitalize border-primary-gold text-primary-gold">
                      {testimonial.type} testimonial
                    </Badge>
                    <span className="text-xs text-[#555]">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#1a1a1a]">
            <MessageSquare className="w-16 h-16 text-[#555] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">
              No {selectedType === 'all' ? '' : selectedType} testimonials found
            </h3>
            <p className="text-[#555] mb-4">
              {selectedType === 'all' 
                ? 'Be the first to share your experience with us!'
                : `No ${selectedType} testimonials available yet.`
              }
            </p>
          </div>
        )}

        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-[#e8e8e8]">
          <h2 className="text-2xl font-bold mb-4 text-[#1a1a1a]">
            Share Your Experience
          </h2>
          <p className="text-[#555] mb-6 max-w-2xl mx-auto">
            Have you worked with ElijahRealtor? We'd love to hear about your experience! 
            Your testimonial helps others make informed decisions about their property journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit-testimonial">
              <Button size="lg" className="bg-primary-gold hover:bg-primary-gold/90 text-white px-8 py-3">
                <MessageSquare className="w-5 h-5 mr-2" />
                Submit Your Testimonial
              </Button>
            </Link>
            <Link to="/properties">
              <Button size="lg" variant="outline" className="border-primary-gold text-primary-gold hover:bg-primary-gold/10 px-8 py-3">
                Browse Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-3xl p-0">
          {selectedMedia && (
            selectedMedia.endsWith('.jpg') || selectedMedia.endsWith('.jpeg') || selectedMedia.endsWith('.png') || selectedMedia.endsWith('.gif') ? (
              <img
                src={selectedMedia}
                alt="Selected testimonial media"
                className="w-full h-full object-contain"
                onLoad={() => setShowMediaDialog(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  setShowMediaDialog(false);
                }}
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={selectedMedia}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Selected testimonial media"
                />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );      Discover why our clients trust us with their property needs. Read their stories and see how we've helped them achieve their real estate goals.
          </p>
        </div>
      </div>
    </>
  );
};

export default Testimonials;