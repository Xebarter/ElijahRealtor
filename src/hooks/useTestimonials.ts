import { useState, useEffect } from 'react';
import { supabase, uploadFile, getPublicUrl, deleteFile } from '@/lib/supabase';
import type { Testimonial, TestimonialForm } from '@/types';

export function useTestimonials(status?: 'pending' | 'approved' | 'rejected', limit?: number) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        // Filter by status
        if (status) {
          query = query.eq('status', status);
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        setTestimonials(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch testimonials');
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [status, limit]);

  const uploadTestimonialMedia = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `testimonials/${fileName}`;

        // Upload file to Supabase Storage
        await uploadFile('testimonial-media', filePath, file);
        
        // Get public URL
        const publicUrl = getPublicUrl('testimonial-media', filePath);
        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Failed to upload testimonial media:', error);
      throw new Error('Failed to upload media files. Please try again.');
    }
  };

  const submitTestimonial = async (testimonialData: {
    client_name: string;
    client_title?: string;
    content: string;
    rating: number;
    country?: string;
    type: 'text' | 'image' | 'video';
    media_urls?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          client_name: testimonialData.client_name,
          client_title: testimonialData.client_title,
          content: testimonialData.content,
          rating: testimonialData.rating,
          country: testimonialData.country,
          type: testimonialData.type,
          media_urls: testimonialData.media_urls || [],
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit testimonial');
    }
  };

  const updateTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === id 
            ? { ...testimonial, status }
            : testimonial
        )
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update testimonial status');
    }
  };

  return { 
    testimonials, 
    loading, 
    error, 
    submitTestimonial,
    uploadTestimonialMedia,
    updateTestimonialStatus,
    refetch: () => {
      setLoading(true);
      // Re-trigger the effect
      setTestimonials([]);
    }
  };
}