import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadFile, getPublicUrl } from '@/lib/supabase';
import type { Testimonial } from '@/types';

export function useTestimonials(status?: 'pending' | 'approved' | 'rejected', limit?: number) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTestimonials(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch testimonials';
      setError(errorMessage);
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const uploadTestimonialMedia = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `testimonials/${fileName}`;

      await uploadFile('testimonial-media', filePath, file);
      const publicUrl = getPublicUrl('testimonial-media', filePath);
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const addTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'status'> & { new_media?: File[] }) => {
    try {
      let media_urls = testimonialData.media_urls || [];
      if (testimonialData.new_media && testimonialData.new_media.length > 0) {
        const newUrls = await uploadTestimonialMedia(testimonialData.new_media);
        media_urls = [...media_urls, ...newUrls];
      }

      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          ...testimonialData,
          media_urls,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setTestimonials(prev => [data, ...prev]);
      return data;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to add testimonial');
    }
  };

  const updateTestimonial = async (id: string, testimonialData: Partial<Testimonial> & { new_media?: File[] }) => {
    try {
      let media_urls = testimonialData.media_urls || [];
      if (testimonialData.new_media && testimonialData.new_media.length > 0) {
        const newUrls = await uploadTestimonialMedia(testimonialData.new_media);
        media_urls = [...media_urls, ...newUrls];
      }
      
      const { new_media, ...restData } = testimonialData;

      const { data, error } = await supabase
        .from('testimonials')
        .update({ ...restData, media_urls })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTestimonials(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update testimonial');
    }
  };

  const submitTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          ...testimonialData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to submit testimonial');
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete testimonial');
    }
  };

  const updateTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === id
            ? { ...testimonial, status }
            : testimonial
        )
      );
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update testimonial status');
    }
  };

  return {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    updateTestimonialStatus,
    submitTestimonial,
    uploadTestimonialMedia,
    refetch: fetchTestimonials,
  };
}