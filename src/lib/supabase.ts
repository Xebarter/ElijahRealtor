import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          property_type: 'apartment' | 'house' | 'commercial';
          status: 'available' | 'sold' | 'pending';
          location: string;
          city: string;
          country: string;
          size_sqft: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          amenities: string[];
          featured: boolean;
          video_url: string | null;
          developer_id: string | null;
          images: string[];
          created_at: string;
          updated_at: string;
          location_coordinates: any | null;
          location_url: string | null;
          video_tour_url: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          currency?: string;
          property_type: 'apartment' | 'house' | 'commercial';
          status?: 'available' | 'sold' | 'pending';
          location: string;
          city: string;
          country: string;
          size_sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          featured?: boolean;
          video_url?: string | null;
          developer_id?: string | null;
          images?: string[];
          created_at?: string;
          updated_at?: string;
          location_coordinates?: any | null;
          location_url?: string | null;
          video_tour_url?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          currency?: string;
          property_type?: 'apartment' | 'house' | 'commercial';
          status?: 'available' | 'sold' | 'pending';
          location?: string;
          city?: string;
          country?: string;
          size_sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          featured?: boolean;
          video_url?: string | null;
          developer_id?: string | null;
          images?: string[];
          updated_at?: string;
          location_coordinates?: any | null;
          location_url?: string | null;
          video_tour_url?: string | null;
        };
      };
      developers: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          bio: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          website_url: string | null;
          countries: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          bio?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          countries?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          bio?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          countries?: string[];
        };
      };
      property_visits: {
        Row: {
          id: string;
          property_id: string;
          visitor_name: string;
          email: string;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes: string | null;
          admin_notes: string | null;
          payment_status: 'pending' | 'paid';
          transaction_id: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          visitor_name: string;
          email: string;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string | null;
          admin_notes?: string | null;
          payment_status?: 'pending' | 'paid';
          transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          visitor_name?: string;
          email?: string;
          phone?: string;
          preferred_date?: string;
          preferred_time?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string | null;
          admin_notes?: string | null;
          payment_status?: 'pending' | 'paid';
          transaction_id?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          client_name: string;
          client_image_url: string | null;
          content: string;
          video_url: string | null;
          rating: number;
          country: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          client_title: string | null;
          media_urls: any | null;
          type: 'text' | 'image' | 'video';
        };
        Insert: {
          id?: string;
          client_name: string;
          client_image_url?: string | null;
          content: string;
          video_url?: string | null;
          rating: number;
          country?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          client_title?: string | null;
          media_urls?: any | null;
          type?: 'text' | 'image' | 'video';
        };
        Update: {
          id?: string;
          client_name?: string;
          client_image_url?: string | null;
          content?: string;
          video_url?: string | null;
          rating?: number;
          country?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          client_title?: string | null;
          media_urls?: any | null;
          type?: 'text' | 'image' | 'video';
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image_url: string | null;
          category: string | null;
          tags: string[];
          published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
          author_id: string | null;
          author_name: string | null;
          category_id: string | null;
          reading_time_minutes: number | null;
          view_count: number;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string[] | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image_url?: string | null;
          category?: string | null;
          tags?: string[];
          published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
          author_id?: string | null;
          author_name?: string | null;
          category_id?: string | null;
          reading_time_minutes?: number | null;
          view_count?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image_url?: string | null;
          category?: string | null;
          tags?: string[];
          published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          updated_at?: string;
          author_id?: string | null;
          author_name?: string | null;
          category_id?: string | null;
          reading_time_minutes?: number | null;
          view_count?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
        };
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      blog_tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      blog_comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          country: string;
          subject: string;
          message: string;
          status: 'new' | 'read' | 'replied';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          country: string;
          subject: string;
          message: string;
          status?: 'new' | 'read' | 'replied';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          country?: string;
          subject?: string;
          message?: string;
          status?: 'new' | 'read' | 'replied';
        };
      };
      financing_applications: {
        Row: {
          id: string;
          property_id: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          monthly_income: number | null;
          currency: string | null;
          employment_status: string | null;
          id_document_url: string | null;
          income_proof_url: string | null;
          status: 'received' | 'forwarded' | 'approved' | 'rejected';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          monthly_income?: number | null;
          currency?: string | null;
          employment_status?: string | null;
          id_document_url?: string | null;
          income_proof_url?: string | null;
          status?: 'received' | 'forwarded' | 'approved' | 'rejected';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          applicant_name?: string;
          applicant_email?: string;
          applicant_phone?: string;
          monthly_income?: number | null;
          currency?: string | null;
          employment_status?: string | null;
          id_document_url?: string | null;
          income_proof_url?: string | null;
          status?: 'received' | 'forwarded' | 'approved' | 'rejected';
          notes?: string | null;
        };
      };
    };
  };
};

// Helper functions for common operations with improved error handling
export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const getPublicUrl = (bucket: string, path: string) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Get public URL error:', error);
    throw error;
  }
};

export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export const updateVisitPaymentStatus = async (visitId: string, paymentReference: string) => {
  try {
    const { error } = await supabase
      .from('property_visits')
      .update({ payment_status: 'paid', payment_reference: paymentReference })
      .eq('id', visitId);

    if (error) throw error;
  } catch (error) {
    console.error('Update visit payment status error:', error);
    throw error;
  }
};