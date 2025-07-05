import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadFile, deleteFile, getPublicUrl } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { PropertyImage, MediaUploadProgress } from '@/types';

export function usePropertyImages(propertyId?: string) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyImages();
    }
  }, [propertyId]);

  const fetchPropertyImages = async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('feature_type')
        .order('display_order');

      if (error) throw error;

      setImages(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property images');
      console.error('Error fetching property images:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (
    files: File[],
    feature: string,
    onProgress?: (progress: MediaUploadProgress[]) => void
  ): Promise<PropertyImage[]> => {
    if (!propertyId) throw new Error('Property ID is required');

    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${propertyId}/${feature}/${Date.now()}-${index}-${file.name}`;
      const progress: MediaUploadProgress = {
        feature,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };

      try {
        onProgress?.([progress]);

        // Upload file to Supabase Storage
        const uploadData = await uploadFile('property-feature-images', fileName, file);
        
        progress.progress = 50;
        onProgress?.([progress]);

        // Get public URL
        const imageUrl = getPublicUrl('property-feature-images', fileName);

        // Save to database
        const { data, error } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            feature_type: feature,
            image_url: imageUrl,
            storage_path: fileName,
            display_order: index,
            alt_text: `${feature} - ${file.name}`
          })
          .select()
          .single();

        if (error) throw error;

        progress.progress = 100;
        progress.status = 'completed';
        onProgress?.([progress]);

        return data;
      } catch (error: any) {
        progress.status = 'error';
        onProgress?.([progress]);
        throw error;
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);
    
    // Refresh the images list
    await fetchPropertyImages();
    
    return uploadedImages;
  };

  const deleteImage = async (imageId: string) => {
    try {
      // Get image details first
      const { data: image, error: fetchError } = await supabase
        .from('property_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      await deleteFile('property-feature-images', image.storage_path);

      // Delete from database
      const { error: deleteError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast.success('Image deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
      throw error;
    }
  };

  const updateImageOrder = async (imageId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('property_images')
        .update({ display_order: newOrder })
        .eq('id', imageId);

      if (error) throw error;

      // Update local state
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, display_order: newOrder }
            : img
        ).sort((a, b) => a.display_order - b.display_order)
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update image order');
      throw error;
    }
  };

  const getImagesByFeature = (feature: string) => {
    return images
      .filter(img => img.feature_type === feature)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getAllFeatures = () => {
    const features = [...new Set(images.map(img => img.feature_type))];
    return features.sort();
  };

  return {
    images,
    loading,
    error,
    uploadImages,
    deleteImage,
    updateImageOrder,
    getImagesByFeature,
    getAllFeatures,
    refetch: fetchPropertyImages
  };
}

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      setUploading(true);
      setError(null);
      
      const fileName = `${propertyId}/video-tour-${Date.now()}.${file.name.split('.').pop()}`;
      
      // Upload to Supabase Storage
      await uploadFile('property-videos', fileName, file);
      
      // Get public URL
      const videoUrl = getPublicUrl('property-videos', fileName);
      
      return videoUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteVideo = async (videoPath: string) => {
    try {
      await deleteFile('property-videos', videoPath);
      toast.success('Video deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete video');
      throw error;
    }
  };

  return {
    uploading,
    uploadVideo,
    deleteVideo
  };
}