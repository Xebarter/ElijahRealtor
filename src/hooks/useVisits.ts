import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Visit } from '@/types';

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          property:properties(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visits');
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(prevVisits =>
        prevVisits.map(visit =>
          visit.id === visitId
            ? { ...visit, status: status as any, admin_notes: notes || visit.admin_notes }
            : visit
        )
      );

      toast.success(`Visit ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update visit status');
      throw error;
    }
  };

  const createVisit = async (visitData: {
    property_id: string;
    name: string;
    email: string;
    phone: string;
    preferred_time: string;
    message?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          property_id: visitData.property_id,
          name: visitData.name,
          email: visitData.email,
          phone: visitData.phone,
          preferred_time: visitData.preferred_time,
          message: visitData.message,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create visit booking');
    }
  };

  const updateVisitPayment = async (visitId: string, transactionId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
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

  return { 
    visits, 
    loading, 
    error, 
    updateVisitStatus, 
    createVisit,
    updateVisitPayment,
    refetch: fetchVisits 
  };
}