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
              title={`${testimonial.client_name} testimonial`}
            />
          </div>
        );
      } else if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`${testimonial.client_name} testimonial`}
            />
          </div>
        );
      } else {
        // Direct video file
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }

    if (testimonial.type === 'image' && testimonial.media_urls?.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {testimonial.media_urls.slice(0, 4).map((imageUrl: string, index: number) => (
            <div 
              key={index} 
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedMedia(imageUrl);
                setShowMediaDialog(true);
              }}
            >
              <img
                src={imageUrl}
                alt={`${testimonial.client_name} testimonial image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const getTypeStats = () => {
    const stats = {
      all: testimonials.length,
      text: testimonials.filter(t => t.type === 'text').length,
      image: testimonials.filter(t => t.type === 'image').length,
      video: testimonials.filter(t => t.type === 'video').length,
    };
    return stats;
  };

  const stats = getTypeStats();
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefefe] flex items-center justify-center font-[Cinzel]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fefefe] flex items-center justify-center font-[Cinzel]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-primary-gold hover:bg-primary-gold/90 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Client Testimonials"
        description="Read what our satisfied clients say about ElijahRealtor. Discover real experiences from property buyers, sellers, and investors across Africa."
        keywords="testimonials, client reviews, real estate feedback, property success stories, ElijahRealtor reviews"
      />

      <div className="min-h-screen bg-[#fefefe] font-[Cinzel]">
        {/* Hero Section */}
        <div className="bg-white text-[#1a1a1a] py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-primary-gold">Client Testimonials</h1>
            <p className="text-base sm:text-xl text-[#555] max-w-2xl mx-auto mb-6 sm:mb-8">
              Hear from our satisfied clients who found their dream properties with ElijahRealtor
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
          {/* Filter Tabs */}
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
          {/* Testimonials Grid */}
          {filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-8 sm:mb-12">
              {filteredTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  className="testimonial-card animate-fade-in-up h-full bg-white border border-[#e8e8e8] shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Quote Icon and Rating */}
                    <div className="flex justify-between items-start mb-4">
                      <Quote className="w-8 h-8 text-primary-gold/30" />
                      <div className="flex space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Media Content */}
                    {renderTestimonialMedia(testimonial)}

                    {/* Testimonial Content */}
                    <div className="flex-1">
                      <p className="text-[#666] mb-6 italic leading-relaxed">
                        "{testimonial.content}"
                      </p>
                    </div>

                    {/* Client Info */}
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

                    {/* Type Badge */}
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

          {/* Call to Action */}
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
      </div>>
        {/* Hero Section */}
        <div className="bg-white text-[#1a1a1a] py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-primary-gold">Client Testimonials</h1>
            <p className="text-base sm:text-xl text-[#555] max-w-2xl mx-auto mb-6 sm:mb-8">
              Hear from our satisfied clients who found their dream properties with ElijahRealtor
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
          {/* Filter Tabs */}
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
          {/* Testimonials Grid */}
          {filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-8 sm:mb-12">
              {filteredTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  className="testimonial-card animate-fade-in-up h-full bg-white border border-[#e8e8e8] shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Quote Icon and Rating */}
                    <div className="flex justify-between items-start mb-4">
                      <Quote className="w-8 h-8 text-primary-gold/30" />
                      <div className="flex space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Media Content */}
                    {renderTestimonialMedia(testimonial)}

                    {/* Testimonial Content */}
                    <div className="flex-1">
                      <p className="text-[#666] mb-6 italic leading-relaxed">
                        "{testimonial.content}"
                      </p>
                    </div>

                    {/* Client Info */}
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

                    {/* Type Badge */}
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

          {/* Call to Action */}
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
      </div>

      {/* Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-3xl p-0">
          <div className="p-1">
            <img 
              src={selectedMedia || ''} 
              alt="Testimonial media" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Testimonials;