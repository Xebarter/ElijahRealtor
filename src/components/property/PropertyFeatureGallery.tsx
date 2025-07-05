import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PROPERTY_FEATURES } from '@/types';
import type { PropertyImage, FeatureImageGroup } from '@/types';

interface PropertyFeatureGalleryProps {
  images: PropertyImage[];
  className?: string;
}

const PropertyFeatureGallery: React.FC<PropertyFeatureGalleryProps> = ({
  images,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Group images by feature
  const groupedImages: FeatureImageGroup[] = PROPERTY_FEATURES
    .map(feature => ({
      feature: feature.value,
      images: images
        .filter(img => img.feature_type === feature.value)
        .sort((a, b) => a.display_order - b.display_order)
    }))
    .filter(group => group.images.length > 0);

  const allImages = images.sort((a, b) => a.display_order - b.display_order);

  const openLightbox = (image: PropertyImage) => {
    setSelectedImage(image);
    setCurrentImageIndex(allImages.findIndex(img => img.id === image.id));
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    let newIndex = currentImageIndex;
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
    } else {
      newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
    }

    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const getFeatureLabel = (featureValue: string) => {
    return PROPERTY_FEATURES.find(f => f.value === featureValue)?.label || featureValue;
  };

  if (groupedImages.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No images available for this property</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {groupedImages.map((group) => (
        <Card key={group.feature}>
          <CardHeader>
            <CardTitle className="text-xl text-primary-navy">
              {getFeatureLabel(group.feature)} ({group.images.length} photos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.images.length === 1 ? (
              // Single image - full width
              <div 
                className="relative cursor-pointer group"
                onClick={() => openLightbox(group.images[0])}
              >
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={group.images[0].image_url}
                    alt={group.images[0].alt_text || `${getFeatureLabel(group.feature)} image`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ) : (
              // Multiple images - grid layout
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative cursor-pointer group"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `${getFeatureLabel(group.feature)} image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedImage && (
            <div className="relative w-full h-full bg-black">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.alt_text || 'Property image'}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                  }}
                />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">
                      {getFeatureLabel(selectedImage.feature_type)}
                    </h3>
                    {selectedImage.alt_text && (
                      <p className="text-sm text-gray-300">{selectedImage.alt_text}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {currentImageIndex + 1} of {allImages.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyFeatureGallery;