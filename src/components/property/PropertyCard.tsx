import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/countries';
import type { Property } from '@/types';
import React, { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, featured = false }) => {
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

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      apartment: 'Apartment',
      house: 'House',
      commercial: 'Commercial',
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Get the first image from property_images or fallback to legacy images array
  const getMainImage = () => {
    if (property.property_images && property.property_images.length > 0) {
      // Try to find the first 'exterior' image by display_order
      const exteriorImages = property.property_images
        .filter(img => img.feature_type === 'exterior')
        .sort((a, b) => a.display_order - b.display_order);
      if (exteriorImages.length > 0) {
        return exteriorImages[0].image_url;
      }
      // Fallback: sort all images by display_order and get the first one
      const sortedImages = property.property_images.sort((a, b) => a.display_order - b.display_order);
      return sortedImages[0].image_url;
    }
    // Fallback to legacy images array
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    
    return null;
  };

  const mainImage = getMainImage();
  const hasVideo = property.video_tour_url || property.video_url;

  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/properties/${property.id}`}
      className={`block property-card transition-shadow hover:shadow-lg focus:shadow-lg outline-none ${featured ? 'border border-primary-gold' : ''}`}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${property.title}`}
    >
      {/* Image Container */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-200">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <span className="w-12 h-12 bg-gray-300 rounded-full" />
          </div>
        )}
        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            loading="lazy"
            className={`object-cover w-full h-64 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.featured && (
            <Badge className="bg-primary-gold text-primary-navy">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {getStatusBadge(property.status)}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {getPropertyTypeLabel(property.property_type)}
          </Badge>
          {hasVideo && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              <Play className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
        </div>

        {/* Country Flag */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {property.country}
          </Badge>
        </div>

        {/* Image Count */}
        {property.property_images && property.property_images.length > 1 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              +{property.property_images.length - 1} photos
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-primary-navy">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-primary-gold" />
          <span className="text-sm">{property.location}, {property.city}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} Bed</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
          {property.size_sqft && (
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.size_sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Developer */}
        {property.developer && (
          <div className="text-xs text-gray-500 mb-3">
            By {property.developer.name}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <span className="w-full">
            <Button className="w-full btn-primary pointer-events-none" tabIndex={-1}>View Details</Button>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;