import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { usePropertyImages } from '@/hooks/usePropertyMedia';
import { PROPERTY_FEATURES } from '@/types';
import type { PropertyFeatureType, MediaUploadProgress } from '@/types';
import imageCompression from 'browser-image-compression';

interface PropertyImageUploadProps {
  propertyId?: string;
  onImagesChange?: (images: any[]) => void;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyId,
  onImagesChange
}) => {
  const [selectedFeature, setSelectedFeature] = useState<PropertyFeatureType>('exterior');
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const { 
    images, 
    loading, 
    uploadImages, 
    deleteImage, 
    getImagesByFeature,
    getAllFeatures 
  } = usePropertyImages(propertyId);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !propertyId) return;

    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        console.warn(`Skipping invalid file: ${file.name}`);
      }
      return isValid;
    });

    if (validFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    // Compress images before upload
    const compressedFiles = await Promise.all(validFiles.map(async (file) => {
      try {
        return await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
      } catch (err) {
        console.warn('Compression failed for', file.name, err);
        return file; // fallback to original if compression fails
      }
    }));

    try {
      await uploadImages(compressedFiles, selectedFeature, setUploadProgress);
      onImagesChange?.(images);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadProgress([]);
    }
  }, [propertyId, selectedFeature, uploadImages, images, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
        onImagesChange?.(images);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const allFeatures = getAllFeatures();

  if (!propertyId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Please save the property first to upload images
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-gold" />
            Property Images by Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Feature to Upload Images
            </label>
            <Select value={selectedFeature} onValueChange={(value: PropertyFeatureType) => setSelectedFeature(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_FEATURES.map((feature) => (
                  <SelectItem key={feature.value} value={feature.value}>
                    {feature.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary-gold bg-primary-gold/10' 
                : 'border-gray-300 hover:border-primary-gold'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload images for {PROPERTY_FEATURES.find(f => f.value === selectedFeature)?.label}
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button type="button" className="btn-primary">
                Select Images
              </Button>
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadProgress.map((progress, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{progress.fileName}</span>
                      <span>{progress.progress}%</span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                  </div>
                  {progress.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Images Display */}
      {allFeatures.length > 0 && (
        <div className="space-y-6">
          {allFeatures.map((feature) => {
            const images = getImagesByFeature(feature);
            const featureLabel = PROPERTY_FEATURES.find(f => f.value === feature)?.label || feature;
            
            return (
              <Card key={feature}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {featureLabel} ({images.length} images)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || `${featureLabel} image`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                              }}
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                              #{image.display_order + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No images uploaded for {featureLabel} yet
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading images...</span>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Image Upload Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload multiple images per feature for better property showcase</li>
          <li>• Recommended image size: 1920x1080 pixels or higher</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Images are automatically optimized for web display</li>
          <li>• You can upload up to 10 images per feature</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertyImageUpload;