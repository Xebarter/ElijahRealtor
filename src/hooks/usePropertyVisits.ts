import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Property } from '@/types';

export interface PropertyVisit {
  id: string;
  property_id: string;
  visitor_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  admin_notes?: string;
  payment_status: 'pending' | 'paid';
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface PropertyVisitFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  property_id?: string;
  search?: string;
}

export interface CreateVisitRequest {
  property_id: string;
  visitor_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
}

export function usePropertyVisits(filters?: PropertyVisitFilters) {
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
  }, [filters]);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('property_visits')
        .select(`
          *,
          property:properties(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('preferred_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('preferred_date', filters.date_to);
      }

      if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id);
      }

      if (filters?.search) {
        query = query.or(`visitor_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVisits(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property visits');
      console.error('Error fetching property visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const createVisitRequest = async (visitData: CreateVisitRequest): Promise<PropertyVisit> => {
    try {
      const { data, error } = await supabase
        .from('property_visits')
        .insert({
          property_id: visitData.property_id,
          visitor_name: visitData.visitor_name,
          email: visitData.email,
          phone: visitData.phone,
          preferred_date: visitData.preferred_date,
          preferred_time: visitData.preferred_time,
          notes: visitData.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the visits list
      await fetchVisits();
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create visit request');
    }
  };

  const updateVisitStatus = async (
    visitId: string, 
    status: PropertyVisit['status'], 
    adminNotes?: string
  ) => {
    try {
      const updateData: any = { status };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('property_visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(prevVisits =>
        prevVisits.map(visit =>
          visit.id === visitId
            ? { ...visit, status, admin_notes: adminNotes || visit.admin_notes }
            : visit
        )
      );

      toast.success(`Visit ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update visit status');
      throw error;
    }
  };

  const updateVisitDetails = async (
    visitId: string,
    updates: Partial<Pick<PropertyVisit, 'visitor_name' | 'email' | 'phone' | 'preferred_date' | 'preferred_time' | 'notes' | 'admin_notes'>>
  ) => {
    try {
      const { error } = await supabase
        .from('property_visits')
        .update(updates)
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(prevVisits =>
        prevVisits.map(visit =>
          visit.id === visitId
            ? { ...visit, ...updates }
            : visit
        )
      );

      toast.success('Visit details updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update visit details');
      throw error;
    }
  };

  const deleteVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('property_visits')
        .delete()
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(prevVisits => prevVisits.filter(visit => visit.id !== visitId));

      toast.success('Visit deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete visit');
      throw error;
    }
  };

  const updateVisitPayment = async (visitId: string, transactionId: string) => {
    try {
      const { error } = await supabase
        .from('property_visits')
        .update({
          payment_status: 'paid',
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
          status: 'confirmed'
        })
        .eq('id', visitId);

      if (error) throw error;

      // Refresh visits
      await fetchVisits();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update visit payment');
    }
  };

  const getVisitStats = () => {
    const stats = {
      total: visits.length,
      pending: visits.filter(v => v.status === 'pending').length,
      confirmed: visits.filter(v => v.status === 'confirmed').length,
      completed: visits.filter(v => v.status === 'completed').length,
      cancelled: visits.filter(v => v.status === 'cancelled').length,
      paid: visits.filter(v => v.payment_status === 'paid').length,
    };
    return stats;
  };

  return {
    visits,
    loading,
    error,
    createVisitRequest,
    updateVisitStatus,
    updateVisitDetails,
    deleteVisit,
    updateVisitPayment,
    getVisitStats,
    refetch: fetchVisits
  };
}