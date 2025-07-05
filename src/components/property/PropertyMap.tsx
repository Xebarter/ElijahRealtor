
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyMapProps {
  locationUrl?: string;
  locationCoordinates?: { lat: number; lng: number };
  propertyTitle?: string;
  address?: string;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  locationUrl,
  locationCoordinates,
  propertyTitle = 'Property Location',
  address,
  className = ''
}) => {
  // If no location data is provided, don't render the component
  if (!locationUrl && !locationCoordinates) {
    return null;
  }

  const coordinates = locationCoordinates || { lat: 0, lng: 0 };
  const hasValidCoordinates = coordinates.lat !== 0 && coordinates.lng !== 0;

  const openInGoogleMaps = () => {
    if (locationUrl) {
      window.open(locationUrl, '_blank');
    } else if (hasValidCoordinates) {
      const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const getDirections = () => {
    if (hasValidCoordinates) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      window.open(directionsUrl, '_blank');
    } else if (locationUrl) {
      window.open(locationUrl, '_blank');
    }
  };

  const getEmbedUrl = () => {
    if (hasValidCoordinates) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-TRU6iw&q=${coordinates.lat},${coordinates.lng}&zoom=15`;
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-gold" />
            Location & Directions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getDirections}
              className="flex items-center"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Directions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in Maps
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Address Info */}
        {address && (
          <div className="p-6 border-b">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary-gold mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">{propertyTitle}</h4>
                <p className="text-gray-600">{address}</p>
                {hasValidCoordinates && (
                  <p className="text-sm text-gray-500 mt-1">
                    Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Map Embed */}
        <div className="aspect-video bg-gray-100">
          {getEmbedUrl() ? (
            <iframe
              src={getEmbedUrl()!}
              className="w-full h-full"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${propertyTitle} - Google Maps`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Map not available</p>
                {locationUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInGoogleMaps}
                    className="mt-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Location
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;