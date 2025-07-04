import { useState, useEffect } from 'react';
import { supabase, uploadFile, getPublicUrl, deleteFile } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Developer } from '@/types';

export function useDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('name');

      if (error) throw error;

      setDevelopers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch developers');
      console.error('Error fetching developers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const createDeveloper = async (developerData: Partial<Developer>, logoFile?: File | null) => {
    try {
      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `developer-logos/${fileName}`;

        await uploadFile('developer-logos', filePath, logoFile);
        logoUrl = getPublicUrl('developer-logos', filePath);
      }

      const { data, error } = await supabase
        .from('developers')
        .insert({
          name: developerData.name,
          logo_url: logoUrl,
          bio: developerData.bio,
          contact_email: developerData.contact_email,
          contact_phone: developerData.contact_phone,
          website_url: developerData.website_url,
          countries: developerData.countries || []
        })
        .select()
        .single();

      if (error) throw error;

      setDevelopers(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error('Error creating developer:', error);
      throw new Error(error.message || 'Failed to create developer');
    }
  };

  const updateDeveloper = async (id: string, developerData: Partial<Developer>, logoFile?: File | null) => {
    try {
      let logoUrl = developerData.logo_url;

      // Upload new logo if provided
      if (logoFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `developer-logos/${fileName}`;

        await uploadFile('developer-logos', filePath, logoFile);
        logoUrl = getPublicUrl('developer-logos', filePath);
      }

      const { data, error } = await supabase
        .from('developers')
        .update({
          name: developerData.name,
          logo_url: logoUrl,
          bio: developerData.bio,
          contact_email: developerData.contact_email,
          contact_phone: developerData.contact_phone,
          website_url: developerData.website_url,
          countries: developerData.countries || []
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDevelopers(prev => prev.map(dev => dev.id === id ? data : dev));
      return data;
    } catch (error: any) {
      console.error('Error updating developer:', error);
      throw new Error(error.message || 'Failed to update developer');
    }
  };

  const deleteDeveloper = async (id: string) => {
    try {
      // Get developer to check if it has a logo
      const { data: developer, error: fetchError } = await supabase
        .from('developers')
        .select('logo_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete developer
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete logo if it exists
      if (developer?.logo_url) {
        const logoPath = developer.logo_url.split('/').pop();
        if (logoPath) {
          try {
            await deleteFile('developer-logos', `developer-logos/${logoPath}`);
          } catch (err) {
            console.error('Error deleting logo:', err);
          }
        }
      }

      setDevelopers(prev => prev.filter(dev => dev.id !== id));
    } catch (error: any) {
      console.error('Error deleting developer:', error);
      throw new Error(error.message || 'Failed to delete developer');
    }
  };

  const getDeveloperById = async (id: string): Promise<Developer | null> => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching developer:', error);
      return null;
    }
  };

  return {
    developers,
    loading,
    error,
    createDeveloper,
    updateDeveloper,
    deleteDeveloper,
    getDeveloperById,
    refetch: fetchDevelopers
  };
}