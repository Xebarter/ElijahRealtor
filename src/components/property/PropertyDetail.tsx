import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Calendar, DollarSign, Building, Phone, Mail, Globe, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFeatureCarousel from '@/components/property/PropertyFeatureCarousel';
import PropertyVideoPlayer from '@/components/property/PropertyVideoPlayer';
import PropertyMap from '@/components/property/PropertyMap';
import ScheduleVisitModal from '@/components/property/ScheduleVisitModal';
import FinancingModal from '@/components/property/FinancingModal';
import { useProperty, useRelatedProperties } from '@/hooks/useProperties';
import { formatPrice } from '@/lib/countries';
import { PROPERTY_FEATURES } from '@/types';
import type { Property, PropertyImage } from '@/types';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { property, loading, error } = useProperty(id!);
  const { properties: relatedProperties } = useRelatedProperties(
    id!, 
    property?.country || '', 
    3
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/properties">
            <Button className="btn-primary">Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      available: 'bg-accent-positive text-white',
      pending: 'bg-yellow-500 text-white',
      sold: 'bg-red-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Group images by feature
  const groupImagesByFeature = (images: PropertyImage[]) => {
    const grouped: Record<string, PropertyImage[]> = {};
    
    images.forEach(image => {
      if (!grouped[image.feature_type]) {
        grouped[image.feature_type] = [];
      }
      grouped[image.feature_type].push(image);
    });

    // Sort images within each feature by display_order
    Object.keys(grouped).forEach(feature => {
      grouped[feature].sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  };

  const propertyImages = property.property_images || [];
  const groupedImages = groupImagesByFeature(propertyImages);
  const hasImages = propertyImages.length > 0;
  const hasVideo = property.video_tour_url || property.video_url;

  // Get ordered features that have images
  const featuresWithImages = PROPERTY_FEATURES
    .filter(feature => groupedImages[feature.value] && groupedImages[feature.value].length > 0)
    .map(feature => feature.value);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/properties" 
            className="inline-flex items-center text-primary-navy hover:text-primary-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Images by Feature */}
            {hasImages ? (
              <div className="mb-8 space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-navy mb-2">Property Gallery</h2>
                  <p className="text-gray-600">Explore different areas of this beautiful property</p>
                </div>
                
                {featuresWithImages.map((feature) => (
                  <PropertyFeatureCarousel
                    key={feature}
                    feature={feature}
                    images={groupedImages[feature]}
                  />
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No images available for this property</p>
                  </div>
                </div>
              </div>
            )}

            {/* Video Tour */}
            {hasVideo && (
              <PropertyVideoPlayer
                videoUrl={property.video_tour_url || property.video_url}
                title={`${property.title} - Video Tour`}
                className="mb-8"
              />
            )}

            {/* Property Details */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                      {property.description}
                    </p>
                    
                    {/* Property Specifications */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      {property.bedrooms && (
                        <div className="text-center">
                          <Bed className="w-6 h-6 mx-auto mb-2 text-primary-gold" />
                          <div className="font-semibold">{property.bedrooms}</div>
                          <div className="text-sm text-gray-600">Bedrooms</div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="text-center">
                          <Bath className="w-6 h-6 mx-auto mb-2 text-primary-gold" />
                          <div className="font-semibold">{property.bathrooms}</div>
                          <div className="text-sm text-gray-600">Bathrooms</div>
                        </div>
                      )}
                      {property.size_sqft && (
                        <div className="text-center">
                          <Square className="w-6 h-6 mx-auto mb-2 text-primary-gold" />
                          <div className="font-semibold">{property.size_sqft.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Sq Ft</div>
                        </div>
                      )}
                      <div className="text-center">
                        <Building className="w-6 h-6 mx-auto mb-2 text-primary-gold" />
                        <div className="font-semibold capitalize">{property.property_type}</div>
                        <div className="text-sm text-gray-600">Type</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {property.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-primary-gold rounded-full mr-3"></div>
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No amenities listed for this property.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <PropertyMap
                  locationUrl={property.location_url}
                  locationCoordinates={property.location_coordinates}
                  propertyTitle={property.title}
                  address={`${property.location}, ${property.city}, ${property.country}`}
                />
              </TabsContent>

              <TabsContent value="developer" className="mt-6">
                {property.developer ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Developer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        {property.developer.logo_url && (
                          <img
                            src={property.developer.logo_url}
                            alt={property.developer.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary-navy mb-2">
                            {property.developer.name}
                          </h3>
                          {property.developer.bio && (
                            <p className="text-gray-600 mb-4">{property.developer.bio}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {property.developer.contact_email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1 text-primary-gold" />
                                <a 
                                  href={`mailto:${property.developer.contact_email}`}
                                  className="text-primary-navy hover:text-primary-gold"
                                >
                                  {property.developer.contact_email}
                                </a>
                              </div>
                            )}
                            {property.developer.contact_phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1 text-primary-gold" />
                                <a 
                                  href={`tel:${property.developer.contact_phone}`}
                                  className="text-primary-navy hover:text-primary-gold"
                                >
                                  {property.developer.contact_phone}
                                </a>
                              </div>
                            )}
                            {property.developer.website_url && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-1 text-primary-gold" />
                                <a 
                                  href={property.developer.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-navy hover:text-primary-gold"
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No developer information available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price and Status */}
            <Card className="mb-6 sticky top-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-3xl font-bold text-primary-navy mb-2">
                      {formatPrice(property.price, property.currency)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(property.status)}
                      {property.featured && (
                        <Badge className="bg-primary-gold text-primary-navy">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-primary-gold" />
                    <span className="text-sm">{property.location}, {property.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building className="w-4 h-4 mr-2 text-primary-gold" />
                    <span className="text-sm capitalize">{property.property_type}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full btn-primary"
                    onClick={() => setShowVisitModal(true)}
                    disabled={property.status !== 'available'}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Visit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full btn-outline"
                    onClick={() => setShowFinancingModal(true)}
                    disabled={property.status !== 'available'}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Apply for Financing
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contact">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Agent
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary-navy mb-8">
              Similar Properties in {property.country}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProperties.map((relatedProperty) => (
                <PropertyCard key={relatedProperty.id} property={relatedProperty} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleVisitModal
        property={property}
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
      />
      <FinancingModal
        property={property}
        isOpen={showFinancingModal}
        onClose={() => setShowFinancingModal(false)}
      />
    </div>
  );
};

export default PropertyDetail;