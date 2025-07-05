import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LocationInputProps {
  locationUrl?: string;
  locationCoordinates?: { lat: number; lng: number };
  onLocationChange?: (data: { url?: string; coordinates?: { lat: number; lng: number } }) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  locationUrl,
  locationCoordinates,
  onLocationChange
}) => {
  const [url, setUrl] = useState(locationUrl || '');
  const [coordinates, setCoordinates] = useState(locationCoordinates || { lat: 0, lng: 0 });
  const [activeTab, setActiveTab] = useState('url');

  useEffect(() => {
    setUrl(locationUrl || '');
    setCoordinates(locationCoordinates || { lat: 0, lng: 0 });
  }, [locationUrl, locationCoordinates]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    onLocationChange?.({ url: newUrl, coordinates });
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    const newCoordinates = { lat, lng };
    setCoordinates(newCoordinates);
    onLocationChange?.({ url, coordinates: newCoordinates });
  };

  const extractCoordinatesFromUrl = (googleMapsUrl: string) => {
    // Extract coordinates from Google Maps URL
    const coordMatch = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      handleCoordinatesChange(lat, lng);
      return true;
    }
    return false;
  };

  const handleUrlSubmit = () => {
    if (url && url.includes('google.com/maps')) {
      extractCoordinatesFromUrl(url);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleCoordinatesChange(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const generateGoogleMapsUrl = () => {
    if (coordinates.lat && coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      setUrl(mapsUrl);
      onLocationChange?.({ url: mapsUrl, coordinates });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-gold" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Google Maps URL</TabsTrigger>
            <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Share URL
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://www.google.com/maps/place/..."
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUrlSubmit}
                  disabled={!url}
                >
                  Extract Coords
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Paste a Google Maps share URL to automatically extract coordinates
              </p>
            </div>

            {url && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preview:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open in Maps
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded border text-sm break-all">
                  {url}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coordinates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., -1.2921"
                  value={coordinates.lat || ''}
                  onChange={(e) => handleCoordinatesChange(
                    parseFloat(e.target.value) || 0,
                    coordinates.lng
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 36.8219"
                  value={coordinates.lng || ''}
                  onChange={(e) => handleCoordinatesChange(
                    coordinates.lat,
                    parseFloat(e.target.value) || 0
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-1"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={generateGoogleMapsUrl}
                disabled={!coordinates.lat || !coordinates.lng}
                className="flex-1"
              >
                <Map className="w-4 h-4 mr-2" />
                Generate Maps URL
              </Button>
            </div>

            {coordinates.lat && coordinates.lng && (
              <div className="bg-green-50 p-3 rounded border">
                <p className="text-sm text-green-800">
                  <strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Map Preview */}
        {(coordinates.lat && coordinates.lng) && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Map Preview</h4>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-TRU6iw&q=${coordinates.lat},${coordinates.lng}&zoom=15`}
                className="w-full h-full"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to get location data:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Go to Google Maps and find the property location</li>
            <li>• Right-click on the exact location and select "What's here?"</li>
            <li>• Copy the coordinates or share URL</li>
            <li>• Or use the "Current Location" button if you're at the property</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationInput;