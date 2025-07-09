import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import LocationInput from '@/components/admin/LocationInput';
import VideoUpload from '@/components/admin/VideoUpload';
import PropertyFeatureImageUpload from '@/components/admin/PropertyFeatureImageUpload';
import { supabase } from '@/lib/supabase';
import { propertySchema } from '@/lib/validations';
import { COUNTRIES } from '@/lib/countries';
import { useProperty } from '@/hooks/useProperties';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { z } from 'zod';

type PropertyFormData = z.infer<typeof propertySchema>;

const PropertyEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');

  const { property, loading, error } = useProperty(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
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

  // Populate form with existing property data
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        property_type: property.property_type,
        status: property.status,
        location: property.location,
        city: property.city,
        country: property.country,
        size_sqft: property.size_sqft || undefined,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        amenities: property.amenities || [],
        featured: property.featured,
        video_tour_url: property.video_tour_url || property.video_url || undefined,
        location_url: property.location_url || undefined,
        location_coordinates: property.location_coordinates || undefined,
        developer_id: property.developer_id || undefined,
      });
    }
  }, [property, reset]);

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

  const onSubmit = async (data: PropertyFormData) => {
    if (!property) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', property.id);

      if (error) throw error;

      toast.success('Property updated successfully!');
      navigate('/admin/properties');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update property');
      console.error('Property update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-6">The property you're trying to edit doesn't exist.</p>
        <Button onClick={() => navigate('/admin/properties')} className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Edit Property</h1>
          <p className="text-gray-600 mt-2">Update property details and media</p>
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

        {/* Location Pin */}
        <LocationInput
          locationUrl={watch('location_url')}
          locationCoordinates={watch('location_coordinates')}
          onLocationChange={handleLocationChange}
        />

        {/* Video Tour */}
        <VideoUpload
          propertyId={property.id}
          currentVideoUrl={property.video_tour_url}
          onVideoChange={(videoUrl: string | null) => {
            setValue('video_tour_url', videoUrl || undefined);
          }}
        />

        {/* Property Images */}
        <PropertyFeatureImageUpload
          onImagesChange={() => {
            // Refresh property data if needed
            console.log('Images updated');
          }}
        />

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Property
              </>
            )}
          </Button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyEdit;