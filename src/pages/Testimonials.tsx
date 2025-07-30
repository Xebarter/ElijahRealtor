import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, MessageSquare, Users, Heart, Play, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useTestimonials } from '@/hooks/useTestimonials';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';

const Testimonials = () => {
  const { testimonials, loading, error } = useTestimonials('approved');
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const testimonialsPerPage = 9;

  // Filter testimonials based on type and search query
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesType = selectedType === 'all' || testimonial.type === selectedType;
    const matchesSearch = testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         testimonial.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && (searchQuery === '' || matchesSearch);
  });

  // Pagination
  const indexOfLastTestimonial = currentPage * testimonialsPerPage;
  const indexOfFirstTestimonial = indexOfLastTestimonial - testimonialsPerPage;
  const currentTestimonials = filteredTestimonials.slice(indexOfFirstTestimonial, indexOfLastTestimonial);
  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 transition-all duration-200 ${
          index < rating ? 'text-[#ffd51e] fill-current' : 'text-gray-200'
        }`}
      />
    ));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf8f5] to-white">
        <LoadingSpinner size="xl" />
      </div>
    );
  }
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf8f5] to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Testimonials</h2>
        <p className="text-gray-600 mb-6">We're having trouble loading the testimonials. Please try again later.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-[#1a1a1a] text-[#ffd51e] hover:bg-[#2a2a2a]"
        >
          Retry
        </Button>
      </div>
    </div>
  );

  const stats = {
    all: testimonials.length,
    text: testimonials.filter(t => t.type === 'text').length,
    image: testimonials.filter(t => t.type === 'image').length,
    video: testimonials.filter(t => t.type === 'video').length
  };

  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0;

  return (
    <>
      <SEO title="Client Testimonials | Elijah Realtor" description="Read authentic reviews and stories from our satisfied clients about their real estate journey with Elijah Realtor." />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/dots-pattern.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block text-sm font-medium text-[#ffd51e] uppercase tracking-widest mb-4">
              Client Stories
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-cinzel">
              Voices of Satisfaction
            </h1>
            <div className="w-24 h-1 bg-[#ffd51e] mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Discover the experiences of our valued clients and see how we've turned their real estate dreams into reality with exceptional service and expertise.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12 sm:mt-16">
            {[
              { value: stats.all, label: 'Total Reviews', icon: <MessageSquare className="w-6 h-6" /> },
              { value: averageRating.toFixed(1), label: 'Avg. Rating', icon: <Star className="w-6 h-6 fill-current text-[#ffd51e]" /> },
              { value: '98%', label: 'Satisfaction', icon: <Heart className="w-6 h-6 fill-current text-red-500" /> },
              { value: '8+', label: 'Countries', icon: <Users className="w-6 h-6" /> },
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10 hover:border-[#ffd51e]/30 transition-all duration-300">
                <div className="w-12 h-12 bg-[#ffd51e]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#ffd51e]">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#faf8f5] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 sm:mb-12 gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search testimonials..."
                className="pl-10 pr-10 py-6 rounded-lg border-gray-300 focus-visible:ring-2 focus-visible:ring-[#ffd51e] focus-visible:ring-offset-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4 sm:flex gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 p-1 rounded-lg">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 flex items-center justify-center py-2 px-3 text-xs sm:text-sm rounded-md data-[state=active]:bg-[#ffd51e] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-sm transition-all"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>All</span>
                  <span className="ml-1.5 bg-black/10 dark:bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                    {stats.all}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="flex-1 flex items-center justify-center py-2 px-3 text-xs sm:text-sm rounded-md data-[state=active]:bg-[#ffd51e] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-sm transition-all"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Text</span>
                  <span className="ml-1.5 bg-black/10 dark:bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                    {stats.text}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="image" 
                  className="flex-1 flex items-center justify-center py-2 px-3 text-xs sm:text-sm rounded-md data-[state=active]:bg-[#ffd51e] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-sm transition-all"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Photos</span>
                  <span className="ml-1.5 bg-black/10 dark:bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                    {stats.image}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="flex-1 flex items-center justify-center py-2 px-3 text-xs sm:text-sm rounded-md data-[state=active]:bg-[#ffd51e] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-sm transition-all"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Videos</span>
                  <span className="ml-1.5 bg-black/10 dark:bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                    {stats.video}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

        {currentTestimonials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
              {currentTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  className={cn(
                    "group h-full bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
                    "hover:border-[#ffd51e]/50 hover:-translate-y-1"
                  )}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <Quote className="w-8 h-8 text-[#ffd51e]/20 group-hover:text-[#ffd51e]/40 transition-colors duration-300" />
                      <div className="flex space-x-0.5">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {testimonial.media_urls?.length > 0 && (
                      <div 
                        className="relative mb-6 rounded-lg overflow-hidden cursor-pointer group/media"
                        onClick={() => {
                          setSelectedMedia(testimonial.media_urls[0]);
                          setShowMediaDialog(true);
                        }}
                      >
                        {renderTestimonialMedia(testimonial)}
                        <div className="absolute inset-0 bg-black/20 group-hover/media:bg-black/30 transition-all duration-300 flex items-center justify-center">
                          {testimonial.type === 'video' && (
                            <div className="w-12 h-12 bg-[#ffd51e] rounded-full flex items-center justify-center transform group-hover/media:scale-110 transition-transform duration-300">
                              <Play className="w-5 h-5 text-[#1a1a1a] fill-current" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      <blockquote className="text-gray-600 mb-6 leading-relaxed italic">
                        "{testimonial.content.length > 200 ? `${testimonial.content.substring(0, 200)}...` : testimonial.content}"
                      </blockquote>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center">
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
                            {testimonial.client_company && ` • ${testimonial.client_company}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="sr-only">Previous</span>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5 || currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-[#ffd51e] text-[#1a1a1a]'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span className="sr-only">Next</span>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-[#ffd51e]/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#ffd51e]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No testimonials found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery 
                ? 'No testimonials match your search. Try different keywords.'
                : 'We currently have no testimonials to display. Please check back later.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="border-[#ffd51e] text-[#1a1a1a] hover:bg-[#ffd51e]/10"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 sm:p-12 border border-gray-100 mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 font-cinzel">
            Share Your Experience
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
            Have you worked with us? We'd love to hear about your experience! 
            Your testimonial helps others make informed decisions about their property journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit-testimonial">
              <Button 
                size="lg" 
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#ffd51e] px-8 py-6 text-base font-medium transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Share Your Story
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-8 py-6 text-base font-medium transition-all duration-300"
              >
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Media Dialog */}
        <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Testimonial Media</DialogTitle>
            </DialogHeader>
            {selectedMedia && (
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
                {selectedMedia.includes('youtube.com') || selectedMedia.includes('youtu.be') ? (
                  <iframe
                    src={selectedMedia.includes('youtube.com/watch') 
                      ? `https://www.youtube.com/embed/${selectedMedia.split('v=')[1].split('&')[0]}`
                      : `https://www.youtube.com/embed/${selectedMedia.split('youtu.be/')[1]}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                  />
                ) : selectedMedia.includes('vimeo.com') ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${selectedMedia.split('vimeo.com/')[1].split('?')[0]}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Vimeo video"
                  />
                ) : (
                  <img
                    src={selectedMedia}
                    alt="Testimonial media"
                    className="w-full h-full object-contain"
                  />
                )}
                <Button
                  onClick={() => setShowMediaDialog(false)}
                  className="absolute top-4 right-4 rounded-full w-10 h-10 p-0 bg-black/50 hover:bg-black/70 text-white"
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </section>
    </>
  );
};

export default Testimonials;