import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LocationInput from '@/components/admin/LocationInput';
import VideoUpload from '@/components/admin/VideoUpload';
import PropertyFeatureImageUpload from '@/components/admin/PropertyFeatureImageUpload';
import DeveloperSelector from '@/components/admin/DeveloperSelector';
import { supabase, uploadFile, getPublicUrl } from '@/lib/supabase';
import { propertySchema } from '@/lib/validations';
import { COUNTRIES } from '@/lib/countries';

import type { z } from 'zod';

type PropertyFormData = z.infer<typeof propertySchema>;

const PropertyCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | undefined>(undefined);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [featureImages, setFeatureImages] = useState<Record<string, File[]>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'USD',
      property_type: 'apartment',
      status: 'available',
      amenities: [],
      featured: false,
    },
  });

  const watchedAmenities = watch('amenities');
  const watchedCurrency = watch('currency');
  const watchedDeveloperId = watch('developer_id');

  const addAmenity = () => {
    if (amenityInput.trim()) {
      const currentAmenities = getValues('amenities') || [];
      setValue('amenities', [...currentAmenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    const currentAmenities = getValues('amenities') || [];
    setValue('amenities', currentAmenities.filter((_, i) => i !== index));
  };

  const handleLocationChange = (locationData: { url?: string; coordinates?: { lat: number; lng: number } }) => {
    setValue('location_url', locationData.url);
    setValue('location_coordinates', locationData.coordinates);
  };

  const handleVideoChange = (videoUrl: string | null) => {
    setValue('video_tour_url', videoUrl || undefined);
  };

  const handleImagesChange = (imagesByFeature: Record<string, File[]>) => {
    setFeatureImages(imagesByFeature);
  };

  const handleDeveloperSelect = (developerId: string | undefined) => {
    setValue('developer_id', developerId);
  };

  const uploadPropertyImages = async (propertyId: string): Promise<{ success: number; failed: number }> => {
    if (Object.keys(featureImages).length === 0) return { success: 0, failed: 0 };

    setUploadingImages(true);
    setUploadProgress(0);
    setUploadStatus('Preparing to upload images...');
    setUploadErrors([]);

    try {
      const totalFiles = Object.values(featureImages).reduce((total, files) => total + files.length, 0);
      let uploadedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      setUploadStatus(`Uploading ${totalFiles} images...`);

      // Upload images for each feature
      for (const [feature, files] of Object.entries(featureImages)) {
        setUploadStatus(`Uploading ${feature} images...`);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const timestamp = Date.now();
          const fileName = `${propertyId}/${feature}/${timestamp}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          try {
            setUploadStatus(`Uploading ${file.name}...`);
            
            // Upload to Supabase Storage
            const uploadResult = await uploadFile('property-feature-images', fileName, file);
            console.log('Upload result:', uploadResult);
            
            // Get public URL
            const imageUrl = getPublicUrl('property-feature-images', fileName);
            console.log('Generated URL:', imageUrl);

            // Save to property_images table
            const { error: dbError } = await supabase
              .from('property_images')
              .insert({
                property_id: propertyId,
                feature_type: feature,
                image_url: imageUrl,
                storage_path: fileName,
                display_order: i,
                alt_text: `${feature.replace('_', ' ')} - ${file.name}`
              });

            if (dbError) {
              console.error('Database error:', dbError);
              throw dbError;
            }

            uploadedCount++;
            setUploadProgress((uploadedCount / totalFiles) * 100);
            console.log(`Successfully uploaded ${file.name} (${uploadedCount}/${totalFiles})`);
          } catch (error: any) {
            console.error(`Failed to upload ${file.name}:`, error);
            failedCount++;
            errors.push(`${file.name}: ${error.message || 'Upload failed'}`);
            
            // Update progress even for failed uploads
            const processedCount = uploadedCount + failedCount;
            setUploadProgress((processedCount / totalFiles) * 100);
          }
        }
      }

      setUploadErrors(errors);
      setUploadStatus(
        `Upload complete: ${uploadedCount} successful, ${failedCount} failed`
      );

      return { success: uploadedCount, failed: failedCount };
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setUploadErrors([error.message || 'Upload process failed']);
      throw error;
    } finally {
      setUploadingImages(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 3000);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setUploadErrors([]);
    
    try {
      // Create the property first
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          property_type: data.property_type,
          status: data.status,
          location: data.location,
          city: data.city,
          country: data.country,
          size_sqft: data.size_sqft,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities,
          featured: data.featured,
          video_tour_url: data.video_tour_url,
          location_url: data.location_url,
          location_coordinates: data.location_coordinates,
          developer_id: data.developer_id,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedPropertyId(property.id);
      console.log('Property created with ID:', property.id);

      // Upload images if any were selected
      if (Object.keys(featureImages).length > 0) {
        const uploadResult = await uploadPropertyImages(property.id);
        
        if (uploadResult.failed > 0) {
          toast.success(
            `Property created! ${uploadResult.success} images uploaded successfully, ${uploadResult.failed} failed.`,
            { duration: 6000 }
          );
        } else {
          toast.success(`Property and ${uploadResult.success} images uploaded successfully!`);
        }
      } else {
        toast.success('Property created successfully!');
      }
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Property creation error:', error);
      toast.error(error.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessAction = (action: 'edit' | 'list') => {
    setShowSuccessModal(false);
    if (action === 'edit' && createdPropertyId) {
      navigate(`/admin/properties/${createdPropertyId}/edit`);
    } else {
      navigate('/admin/properties');
    }
  };

  const getTotalImageCount = () => {
    return Object.values(featureImages).reduce((total, files) => total + files.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Create New Property</h1>
          <p className="text-gray-600 mt-2">Add a new property to your listings</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/properties')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <Input
                {...register('title')}
                placeholder="Enter property title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <Textarea
                {...register('description')}
                placeholder="Describe the property features, location, and amenities"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <Input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="Enter price"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <Select
                  value={watchedCurrency}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.currency} value={country.currency}>
                        {country.currency} - {country.currencySymbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <Select
                  value={watch('property_type')}
                  onValueChange={(value: 'apartment' | 'house' | 'commercial') => setValue('property_type', value)}
                >
                  <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.property_type.message}</p>
                )}
              </div>
            </div>

            {/* Developer Selector */}
            <DeveloperSelector 
              selectedDeveloperId={watchedDeveloperId}
              onSelect={handleDeveloperSelect}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <Select
                  value={watch('country')}
                  onValueChange={(value) => setValue('country', value)}
                >
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <Input
                  {...register('city')}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Area *
                </label>
                <Input
                  {...register('location')}
                  placeholder="Enter specific location"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size (sq ft)
                </label>
                <Input
                  type="number"
                  {...register('size_sqft', { valueAsNumber: true })}
                  placeholder="Enter size"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <Input
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                  placeholder="Number of bedrooms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <Input
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                  placeholder="Number of bathrooms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: 'available' | 'sold' | 'pending') => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="Add amenity (e.g., Swimming Pool)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity} variant="outline">
                  Add
                </Button>
              </div>
              {watchedAmenities && watchedAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedAmenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-gold/10 text-primary-navy"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', !!checked)}
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Mark as featured property
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Property Images */}
        <PropertyFeatureImageUpload
          onImagesChange={handleImagesChange}
        />

        {/* Location Pin */}
        <LocationInput
          locationUrl={watch('location_url')}
          locationCoordinates={watch('location_coordinates')}
          onLocationChange={handleLocationChange}
        />

        {/* Video Tour */}
        <VideoUpload
          propertyId={createdPropertyId}
          currentVideoUrl={watch('video_tour_url')}
          onVideoChange={(videoUrl: string | null) => handleVideoChange(videoUrl)}
        />

        {/* Upload Progress */}
        {uploadingImages && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-primary-gold" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{uploadStatus}</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                </div>
                
                {uploadErrors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-1">Upload Errors:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {uploadErrors.slice(0, 3).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadErrors.length > 3 && (
                          <li>... and {uploadErrors.length - 3} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
            disabled={isSubmitting || uploadingImages}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Creating Property...
              </>
            ) : uploadingImages ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading Images...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Property
                {getTotalImageCount() > 0 && (
                  <span className="ml-2 bg-primary-gold/20 text-primary-navy px-2 py-1 rounded text-xs">
                    +{getTotalImageCount()} images
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              Property Created Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Your property has been created successfully
              {getTotalImageCount() > 0 && ` with ${getTotalImageCount()} images`}
              {uploadErrors.length > 0 && ` (${uploadErrors.length} upload errors)`}. 
              What would you like to do next?
            </p>
            
            {uploadErrors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some images failed to upload. You can add them later by editing the property.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleSuccessAction('edit')} 
                className="btn-primary w-full"
              >
                Edit Details & Add More Media
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSuccessAction('list')}
                className="w-full"
              >
                View All Properties
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyCreate;