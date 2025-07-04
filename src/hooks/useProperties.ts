import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property, PropertyFilters, PaginationMeta } from '@/types';

export function useProperties(filters?: PropertyFilters, page = 1, limit = 12) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProperties();
  }, [filters, page, limit]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          developer:developers(*),
          property_images(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`);
      }

      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }

      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.country) {
        query = query.ilike('country', `%${filters.country}%`);
      }

      if (filters?.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters?.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      query = query.range(startIndex, startIndex + limit - 1);

      // Order by featured first, then by created_at desc
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      setProperties(data || []);
      setMeta({
        page,
        limit,
        total,
        totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, meta, refetch: fetchProperties };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            developer:developers(*),
            property_images(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setProperty(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch property');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error };
}

export function useFeaturedProperties(limit = 6) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            developer:developers(*),
            property_images(*)
          `)
          .eq('featured', true)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setProperties(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured properties');
        console.error('Error fetching featured properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [limit]);

  return { properties, loading, error };
}

export function useRelatedProperties(propertyId: string, country: string, limit = 3) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            developer:developers(*),
            property_images(*)
          `)
          .neq('id', propertyId)
          .eq('country', country)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setProperties(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch related properties');
        console.error('Error fetching related properties:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId && country) {
      fetchRelatedProperties();
    }
  }, [propertyId, country, limit]);

  return { properties, loading, error };
}