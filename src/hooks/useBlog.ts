import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { deepSanitizeNulls } from '@/lib/utils';

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

      if (filters?.published !== undefined) {
        query = query.eq('published', filters.published);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        throw new Error(`Failed to fetch blog posts: ${fetchError.message}`);
      }

      let filteredPosts = data || [];

      // Filter by tag if specified
      if (filters?.tag) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags && post.tags.includes(filters.tag!)
        );
      }

      setPosts(deepSanitizeNulls(filteredPosts || []));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog posts';
      console.error('Blog fetch error:', err);
      setError(errorMessage);
      setPosts([]);
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
        query = query.eq('category', filters.category);
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

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching post by slug:', fetchError);
        throw new Error(`Failed to fetch blog post: ${fetchError.message}`);
      }

      return data;
    } catch (err) {
      console.error('Post by slug fetch error:', err);
      return null;
    }
  };

  return {
    posts,
    loading,
    error,
    totalPages,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug
  };
};

// Dedicated hook for blog categories
export const useBlogCategories = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: { name: string; slug: string; description?: string }) => {
    try {
      const { data, error: createError } = await supabase
        .from('blog_categories')
        .insert([category])
        .select()
        .single();

      if (createError) {
        console.error('Error creating category:', createError);
        throw new Error(`Failed to create category: ${createError.message}`);
      }

      await fetchCategories();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      console.error('Category creation error:', err);
      throw new Error(errorMessage);
    }
  };

  const updateCategory = async (id: string, category: Partial<BlogCategory>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('blog_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating category:', updateError);
        throw new Error(`Failed to update category: ${updateError.message}`);
      }

      await fetchCategories();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      console.error('Category update error:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting category:', deleteError);
        throw new Error(`Failed to delete category: ${deleteError.message}`);
      }

      await fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      console.error('Category deletion error:', err);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

// Dedicated hook for blog tags
export const useBlogTags = () => {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tag: { name: string; slug: string }) => {
    try {
      const { data, error: createError } = await supabase
        .from('blog_tags')
        .insert([tag])
        .select()
        .single();

      if (createError) {
        console.error('Error creating tag:', createError);
        throw new Error(`Failed to create tag: ${createError.message}`);
      }

      await fetchTags();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tag';
      console.error('Tag creation error:', err);
      throw new Error(errorMessage);
    }
  };

  const updateTag = async (id: string, tag: Partial<BlogTag>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('blog_tags')
        .update(tag)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating tag:', updateError);
        throw new Error(`Failed to update tag: ${updateError.message}`);
      }

      await fetchTags();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tag';
      console.error('Tag update error:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting tag:', deleteError);
        throw new Error(`Failed to delete tag: ${deleteError.message}`);
      }

      await fetchTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tag';
      console.error('Tag deletion error:', err);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag
  };
};

// Dedicated hook for blog comments
export const useBlogComments = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCommentsByPostId = async (postId: string): Promise<BlogComment[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch comments: ${fetchError.message}`);
      }

      setComments(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(errorMessage);
      setComments([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (comment: {
    post_id: string;
    author_name: string;
    author_email: string;
    content: string;
  }) => {
    try {
      setError(null);
      
      const { data, error: createError } = await supabase
        .from('blog_comments')
        .insert([comment])
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create comment: ${createError.message}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    getCommentsByPostId,
    createComment,
  };
};

// Dedicated hook for all blog comments (admin use)
export const useAllBlogComments = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllComments = async (filters?: {
    status?: string;
    postId?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.postId) {
        query = query.eq('post_id', filters.postId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        throw new Error(`Failed to fetch comments: ${fetchError.message}`);
      }

      setComments(deepSanitizeNulls(data || []));
    } catch (err) {
      console.error('Comments fetch error:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (commentId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { data, error: updateError } = await supabase
        .from('blog_comments')
        .update({ status })
        .eq('id', commentId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating comment status:', updateError);
        throw new Error(`Failed to update comment status: ${updateError.message}`);
      }

      await fetchAllComments();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment status';
      console.error('Comment status update error:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        throw new Error(`Failed to delete comment: ${deleteError.message}`);
      }

      await fetchAllComments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      console.error('Comment deletion error:', err);
      throw new Error(errorMessage);
    }
  };

  return {
    comments,
    loading,
    error,
    fetchAllComments,
    updateCommentStatus,
    deleteComment
  };
};

// Dedicated hook for blog statistics
export const useBlogStats = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalComments: 0,
    pendingComments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsResult, commentsResult] = await Promise.all([
        supabase.from('blog_posts').select('published'),
        supabase.from('blog_comments').select('status')
      ]);

      if (postsResult.error) {
        throw new Error(`Failed to fetch posts: ${postsResult.error.message}`);
      }

      if (commentsResult.error) {
        throw new Error(`Failed to fetch comments: ${commentsResult.error.message}`);
      }

      const posts = postsResult.data || [];
      const comments = commentsResult.data || [];

      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.published).length,
        totalComments: comments.length,
        pendingComments: comments.filter(c => c.status === 'pending').length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Dedicated hook for fetching a single blog post by id
export const useBlogPost = (id: string | undefined) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) {
        setError(fetchError.message);
        setPost(null);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  return { post, loading, error };
};