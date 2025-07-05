import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PROPERTY_FEATURES } from '@/types';
import type { PropertyImage } from '@/types';

interface PropertyFeatureCarouselProps {
  feature: string;
  images: PropertyImage[];
  className?: string;
}

const PropertyFeatureCarousel: React.FC<PropertyFeatureCarouselProps> = ({
  feature,
  images,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const featureLabel = PROPERTY_FEATURES.find(f => f.value === feature)?.label || feature;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getFeatureIcon = (featureValue: string) => {
    const iconMap: Record<string, string> = {
      kitchen: '🍽️',
      living_room: '🛋️',
      master_bedroom: '🛏️',
      bedroom: '🛏️',
      bathroom: '🛁',
      dining_room: '🍽️',
      balcony: '🌅',
      garden: '🌳',
      garage: '🚗',
      pool: '🏊',
      gym: '💪',
      office: '💼',
      laundry: '🧺',
      storage: '📦',
      exterior: '🏠',
      other: '📷'
    };
    return iconMap[featureValue] || '📷';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Feature Header */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getFeatureIcon(feature)}</span>
        <h3 className="text-xl font-semibold text-primary-navy">
          {featureLabel}
        </h3>
        <span className="text-sm text-gray-500">
          ({images.length} photo{images.length !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Main Image */}
        <div 
          className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openLightbox(currentIndex)}
        >
          <img
            src={images[currentIndex].image_url}
            alt={images[currentIndex].alt_text || `${featureLabel} image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
            }}
          />
          
          {/* Zoom Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex 
                  ? 'border-primary-gold' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.image_url}
                alt={`${featureLabel} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevLightboxImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextLightboxImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Lightbox Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={images[lightboxIndex].image_url}
                alt={images[lightboxIndex].alt_text || `${featureLabel} image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                }}
              />
            </div>

            {/* Lightbox Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{featureLabel}</h3>
                  {images[lightboxIndex].alt_text && (
                    <p className="text-sm text-gray-300">{images[lightboxIndex].alt_text}</p>
                  )}
                </div>
                <div className="text-sm text-gray-300">
                  {lightboxIndex + 1} of {images.length}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyFeatureCarousel;