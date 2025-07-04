import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, VisitBooking, FinancingApplication, ContactMessage } from '@/types';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch properties stats
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, status, country');

        if (propertiesError) throw propertiesError;

        // Fetch visits stats
        const { data: visits, error: visitsError } = await supabase
          .from('property_visits')
          .select('id, status, payment_status, created_at');

        if (visitsError) throw visitsError;

        // Fetch financing applications
        const { data: financing, error: financingError } = await supabase
          .from('financing_applications')
          .select('id, status');

        if (financingError) throw financingError;

        // Fetch contact messages for additional stats
        const { data: contacts, error: contactsError } = await supabase
          .from('contact_messages')
          .select('id, status, created_at');

        if (contactsError) throw contactsError;

        // Calculate stats
        const totalProperties = properties?.length || 0;
        const activeListings = properties?.filter(p => p.status === 'available').length || 0;
        const soldProperties = properties?.filter(p => p.status === 'sold').length || 0;
        const pendingBookings = visits?.filter(v => v.status === 'pending').length || 0;
        const financingApplications = financing?.length || 0;

        // Group properties by country
        const propertiesByCountry = properties?.reduce((acc: any[], property) => {
          const existing = acc.find(item => item.country === property.country);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ country: property.country, count: 1 });
          }
          return acc;
        }, []) || [];

        // Recent activity (combining visits and contacts)
        const visitActivities = visits?.slice(0, 5).map(visit => ({
          id: visit.id,
          type: 'booking_created' as const,
          description: `New visit booking received`,
          timestamp: visit.created_at,
          country: undefined
        })) || [];

        const contactActivities = contacts?.slice(0, 5).map(contact => ({
          id: contact.id,
          type: 'contact_received' as const,
          description: `New contact message received`,
          timestamp: contact.created_at,
          country: undefined
        })) || [];

        // Combine and sort recent activities
        const recentActivity = [...visitActivities, ...contactActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);

        const dashboardStats: DashboardStats = {
          totalProperties,
          activeListings,
          soldProperties,
          pendingBookings,
          financingApplications,
          monthlyRevenue: 125000, // This would need to be calculated from actual payment data
          conversionRate: 15.5, // This would need to be calculated from actual conversion data
          propertiesByCountry,
          recentActivity
        };

        setStats(dashboardStats);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard stats');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useVisitBookings() {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('property_visits')
          .select(`
            *,
            property:properties(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match VisitBooking interface
        const transformedBookings = data?.map(visit => ({
          id: visit.id,
          property_id: visit.property_id,
          client_name: visit.visitor_name,
          client_email: visit.email,
          client_phone: visit.phone,
          visit_date: visit.preferred_date,
          visit_time: visit.preferred_time,
          status: visit.status,
          payment_reference: visit.transaction_id,
          payment_amount: undefined, // Would need to be stored or calculated
          currency: undefined,
          notes: visit.notes,
          created_at: visit.created_at,
          property: visit.property
        })) || [];

        setBookings(transformedBookings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch visit bookings');
        console.error('Error fetching visit bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
}

export function useFinancingApplications() {
  const [applications, setApplications] = useState<FinancingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('financing_applications')
          .select(`
            *,
            property:properties(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setApplications(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch financing applications');
        console.error('Error fetching financing applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return { applications, loading, error };
}

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMessages(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch contact messages');
        console.error('Error fetching contact messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return { messages, loading, error };
}