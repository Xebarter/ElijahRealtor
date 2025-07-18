import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { deepSanitizeNulls } from '@/lib/utils';
import type { BlogCommentForm, BlogStats } from '@/types/blog';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];
type BlogTag = Database['public']['Tables']['blog_tags']['Row'];
type BlogComment = Database['public']['Tables']['blog_comments']['Row'];

// Main blog hook (keeping for backward compatibility)
export const useBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (filters?: {
    category?: string;
    tag?: string;
    search?: string;
    published?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters?.published !== undefined) {
        query = query.eq('published', filters.published);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        throw new Error(`Failed to fetch categories: ${fetchError.message}`);
      }

      setCategories(deepSanitizeNulls(data || []));
    } catch (err) {
      console.error('Categories fetch error:', err);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching tags:', fetchError);
        throw new Error(`Failed to fetch tags: ${fetchError.message}`);
      }

      setTags(deepSanitizeNulls(data || []));
    } catch (err) {
      console.error('Tags fetch error:', err);
      setTags([]);
    }
  };

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching post by slug:', fetchError);
        throw new Error(`Failed to fetch blog post: ${fetchError.message}`);
      }

      // Increment view count
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog post';
      console.error('Post by slug fetch error:', err);
      setError(errorMessage);
      return null;
    }
  };

  const getCommentsByPostId = async (postId: string): Promise<BlogComment[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        throw new Error(`Failed to fetch comments: ${fetchError.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Comments fetch error:', err);
      return [];
    }
  };

  const createComment = async (comment: {
    post_id: string;
    author_name: string;
    author_email: string;
    content: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('blog_comments')
        .insert([comment])
        .select()
        .single();

      if (createError) {
        console.error('Error creating comment:', createError);
        throw new Error(`Failed to create comment: ${createError.message}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
      console.error('Comment creation error:', err);
      throw new Error(errorMessage);
    }
  };

  const getFeaturedPosts = async (limit: number = 3): Promise<BlogPost[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching featured posts:', fetchError);
        throw new Error(`Failed to fetch featured posts: ${fetchError.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Featured posts fetch error:', err);
      return [];
    }
  };

  const getRecentPosts = async (limit: number = 5): Promise<BlogPost[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching recent posts:', fetchError);
        throw new Error(`Failed to fetch recent posts: ${fetchError.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Recent posts fetch error:', err);
      return [];
    }
  };

  // Update a blog post
  const updatePost = async (
    id: string,
    data: Partial<BlogPost>,
    featuredImage?: File
  ) => {
    let featuredImageUrl = data.featured_image_url;
    if (featuredImage) {
      // Upload the image to Supabase Storage (assuming a 'blog-images' bucket)
      const fileExt = featuredImage.name.split('.').pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, featuredImage, { upsert: true });
      if (uploadError) {
        throw new Error('Failed to upload featured image: ' + uploadError.message);
      }
      featuredImageUrl = uploadData?.path
        ? supabase.storage.from('blog-images').getPublicUrl(uploadData.path).data.publicUrl
        : undefined;
    }
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ ...data, featured_image_url: featuredImageUrl })
      .eq('id', id);
    if (updateError) {
      throw new Error('Failed to update blog post: ' + updateError.message);
    }
  };

  useEffect(() => {
    const initializeBlog = async () => {
      try {
        await Promise.all([
          fetchPosts({ published: true }),
          fetchCategories(),
          fetchTags()
        ]);
      } catch (err) {
        console.error('Blog initialization error:', err);
      }
    };

    initializeBlog();
  }, []);

  return {
    posts,
    categories,
    tags,
    loading,
    error,
    fetchPosts,
    fetchCategories,
    fetchTags,
    getPostBySlug,
    getCommentsByPostId,
    createComment,
    getFeaturedPosts,
    getRecentPosts,
    updatePost,
  };
};

// Dedicated hook for blog posts
export const useBlogPosts = (
  filters: any = {},
  page: number = 1,
  pageSize: number = 10
) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.published !== undefined) {
        query = query.eq('published', filters.published);
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        throw new Error(`Failed to fetch blog posts: ${fetchError.message}`);
      }

      let filteredPosts = data || [];

      if (filters.tag) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags && post.tags.includes(filters.tag)
        );
      }

      setPosts(deepSanitizeNulls(filteredPosts || []));
      setTotalPages(Math.ceil(filteredPosts.length / pageSize));
    } catch (err) {
      console.error('Posts fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags: string[];
    published: boolean;
    author_name: string;
    seo_title?: string;
    seo_description?: string;
    meta_keywords?: string[];
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (createError) {
        console.error('Error creating post:', createError);
        throw new Error(`Failed to create post: ${createError.message}`);
      }

      await fetchPosts();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      console.error('Post creation error:', err);
      throw new Error(errorMessage);
    }
  };

  const updatePost = async (id: string, post: Partial<BlogPost>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating post:', updateError);
        throw new Error(`Failed to update post: ${updateError.message}`);
      }

      await fetchPosts();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      console.error('Post update error:', err);
      throw new Error(errorMessage);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting post:', deleteError);
        throw new Error(`Failed to delete post: ${deleteError.message}`);
      }

      await fetchPosts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      console.error('Post deletion error:', err);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters, page]);

  return {
    posts,
    loading,
    error,
    totalPages,
    createPost,
    updatePost,
    deletePost,
  };
};

export const useBlogComments = (postId?: string) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (comment: BlogCommentForm) => {
    setLoading(true);
    setError(null);
    try {
      const { error: createError } = await supabase
        .from('blog_comments')
        .insert([comment]);
      if (createError) throw createError;
      await fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to create comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return { comments, loading, error, createComment, fetchComments };
};

export const useAllBlogComments = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (filters?: { status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (commentId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('blog_comments')
        .update({ status })
        .eq('id', commentId);

      if (updateError) throw updateError;
      
      // Refresh comments after update
      await fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to update comment status');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;
      
      // Refresh comments after deletion
      await fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
      throw err;
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return { 
    comments, 
    loading, 
    error, 
    fetchComments,
    updateCommentStatus,
    deleteComment
  };
};

export const useBlogStats = () => {
  const [stats, setStats] = useState<BlogStats>({
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
    total_categories: 0,
    total_tags: 0,
    total_comments: 0,
    pending_comments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch posts stats
      const { count: totalPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      const { count: publishedPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      const { count: draftPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', false);

      // Fetch categories count
      const { count: totalCategories } = await supabase
        .from('blog_categories')
        .select('*', { count: 'exact', head: true });

      // Fetch tags count
      const { count: totalTags } = await supabase
        .from('blog_tags')
        .select('*', { count: 'exact', head: true });

      // Fetch comments stats
      const { count: totalComments } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true });

      const { count: pendingComments } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        total_posts: totalPosts || 0,
        published_posts: publishedPosts || 0,
        draft_posts: draftPosts || 0,
        total_categories: totalCategories || 0,
        total_tags: totalTags || 0,
        total_comments: totalComments || 0,
        pending_comments: pendingComments || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blog stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, fetchStats };
};

export const useBlogPost = (postId?: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (fetchError) throw fetchError;
      setPost(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (updates: Partial<BlogPost>) => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      setPost(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update blog post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  return { post, loading, error, fetchPost, updatePost };
};