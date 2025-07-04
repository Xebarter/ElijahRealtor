import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PROPERTY_FEATURES } from '@/types';
import type { PropertyFeatureType } from '@/types';

interface FeatureImageData {
  feature: PropertyFeatureType;
  files: File[];
  previews: string[];
}

interface PropertyFeatureImageUploadProps {
  onImagesChange: (imagesByFeature: Record<string, File[]>) => void;
  className?: string;
}

const PropertyFeatureImageUpload: React.FC<PropertyFeatureImageUploadProps> = ({
  onImagesChange,
  className = ''
}) => {
  const [featureImages, setFeatureImages] = useState<Record<string, FeatureImageData>>({});
  const [dragOverFeature, setDragOverFeature] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Create refs for each file input
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateParent = useCallback((images: Record<string, FeatureImageData>) => {
    const imagesByFeature: Record<string, File[]> = {};
    Object.entries(images).forEach(([feature, data]) => {
      if (data.files.length > 0) {
        imagesByFeature[feature] = data.files;
      }
    });
    onImagesChange(imagesByFeature);
  }, [onImagesChange]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return `${file.name}: Not a valid image file`;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return `${file.name}: File size exceeds 10MB limit`;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `${file.name}: Only JPG, PNG, and WebP formats are allowed`;
    }

    return null;
  };

  const handleFileSelect = useCallback((feature: PropertyFeatureType, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    
    // Validate all files first
    const validFiles = fileArray.filter(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return false;
      }
      return true;
    });

    // Check total count limit
    const existing = featureImages[feature]?.files || [];
    const totalAfterAdd = existing.length + validFiles.length;
    
    if (totalAfterAdd > 10) {
      const allowedCount = 10 - existing.length;
      if (allowedCount <= 0) {
        newErrors.push(`Maximum 10 images allowed per feature. ${feature} already has ${existing.length} images.`);
        setErrors(newErrors);
        return;
      }
      newErrors.push(`Only adding ${allowedCount} images to stay within the 10 image limit for ${feature}.`);
      validFiles.splice(allowedCount);
    }

    if (validFiles.length === 0) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors if we have valid files
    setErrors([]);

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));

    setFeatureImages(prev => {
      const existingData = prev[feature] || { feature, files: [], previews: [] };
      const newData = {
        feature,
        files: [...existingData.files, ...validFiles],
        previews: [...existingData.previews, ...previews]
      };
      
      const updated = { ...prev, [feature]: newData };
      updateParent(updated);
      return updated;
    });

    // Clear the file input value to allow selecting the same files again
    if (fileInputRefs.current[feature]) {
      fileInputRefs.current[feature]!.value = '';
    }

    // Show any warnings
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000); // Clear errors after 5 seconds
    }
  }, [featureImages, updateParent]);

  const handleDrop = useCallback((e: React.DragEvent, feature: PropertyFeatureType) => {
    e.preventDefault();
    setDragOverFeature(null);
    handleFileSelect(feature, e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent, feature: PropertyFeatureType) => {
    e.preventDefault();
    setDragOverFeature(feature);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFeature(null);
  }, []);

  const removeImage = useCallback((feature: PropertyFeatureType, index: number) => {
    setFeatureImages(prev => {
      const existing = prev[feature];
      if (!existing) return prev;

      // Revoke the preview URL to prevent memory leaks
      URL.revokeObjectURL(existing.previews[index]);

      const newFiles = existing.files.filter((_, i) => i !== index);
      const newPreviews = existing.previews.filter((_, i) => i !== index);

      const updated = {
        ...prev,
        [feature]: {
          feature,
          files: newFiles,
          previews: newPreviews
        }
      };

      // Remove the feature entirely if no files left
      if (newFiles.length === 0) {
        delete updated[feature];
      }

      updateParent(updated);
      return updated;
    });
  }, [updateParent]);

  const clearAllImages = useCallback(() => {
    // Revoke all preview URLs
    Object.values(featureImages).forEach(data => {
      data.previews.forEach(preview => URL.revokeObjectURL(preview));
    });
    
    setFeatureImages({});
    updateParent({});
    setErrors([]);
  }, [featureImages, updateParent]);

  const triggerFileInput = useCallback((feature: PropertyFeatureType) => {
    const input = fileInputRefs.current[feature];
    if (input) {
      input.click();
    }
  }, []);

  const getFeatureLabel = (featureValue: string) => {
    return PROPERTY_FEATURES.find(f => f.value === featureValue)?.label || featureValue;
  };

  const getTotalImageCount = () => {
    return Object.values(featureImages).reduce((total, data) => total + data.files.length, 0);
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

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      Object.values(featureImages).forEach(data => {
        data.previews.forEach(preview => URL.revokeObjectURL(preview));
      });
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-primary-gold" />
              Property Images by Feature
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {getTotalImageCount()} images selected
              </div>
              {getTotalImageCount() > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllImages}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROPERTY_FEATURES.map((feature) => {
              const featureData = featureImages[feature.value];
              const isDragOver = dragOverFeature === feature.value;
              const imageCount = featureData?.files.length || 0;
              const canAddMore = imageCount < 10;
              
              return (
                <div key={feature.value} className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <span className="mr-2">{getFeatureIcon(feature.value)}</span>
                    {feature.label}
                    {featureData && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({imageCount}/10)
                      </span>
                    )}
                  </h3>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[feature.value] = el;
                    }}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(feature.value, e.target.files)}
                    className="hidden"
                    id={`upload-${feature.value}`}
                  />
                  
                  {/* Upload Area */}
                  {canAddMore && (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                        isDragOver 
                          ? 'border-primary-gold bg-primary-gold/10' 
                          : 'border-gray-300 hover:border-primary-gold'
                      }`}
                      onDrop={(e) => handleDrop(e, feature.value)}
                      onDragOver={(e) => handleDragOver(e, feature.value)}
                      onDragLeave={handleDragLeave}
                      onClick={() => triggerFileInput(feature.value)}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop images here or click to select
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {10 - imageCount} more images allowed
                      </p>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        className="pointer-events-none"
                        tabIndex={-1}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Select Images
                      </Button>
                    </div>
                  )}

                  {/* Image Previews */}
                  {featureData && featureData.previews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {featureData.previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={preview}
                              alt={`${feature.label} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(feature.value, index);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                            {index + 1}
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                            {(featureData.files[index].size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add More Button for existing images */}
                  {featureData && featureData.files.length > 0 && canAddMore && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => triggerFileInput(feature.value)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add More Images ({10 - imageCount} remaining)
                    </Button>
                  )}

                  {/* Max limit reached message */}
                  {!canAddMore && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Maximum of 10 images reached for this feature
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Guidelines */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Image Upload Guidelines:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload multiple images per feature to showcase different angles</li>
              <li>• Recommended resolution: 1920x1080 pixels or higher</li>
              <li>• Supported formats: JPG, PNG, WebP (max 10MB per image)</li>
              <li>• Maximum 10 images per feature</li>
              <li>• Images will be automatically optimized for web display</li>
              <li>• Drag and drop multiple files at once for faster uploads</li>
            </ul>
          </div>

          {/* Summary */}
          {getTotalImageCount() > 0 && (
            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Upload Summary:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-green-800">
                {Object.entries(featureImages).map(([feature, data]) => (
                  <div key={feature} className="flex justify-between">
                    <span>{getFeatureLabel(feature)}:</span>
                    <span className="font-medium">{data.files.length} images</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{getTotalImageCount()} images</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFeatureImageUpload;