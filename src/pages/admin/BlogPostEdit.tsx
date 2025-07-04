import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBlog, useBlogPost } from '@/hooks/useBlog';
import toast from 'react-hot-toast';
import type { BlogPostForm as BlogPostFormType } from '@/types/blog';

const BlogPostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePost } = useBlog();
  const { post, loading, error } = useBlogPost(id);

  const handleSubmit = async (
    data: BlogPostFormType,
    featuredImageRemoved: boolean,
    featuredImage?: File
  ) => {
    if (!id || !post) return;
    setIsSubmitting(true);
    try {
      const { category_id, tags, ...rest } = data;
      const updateObj: any = {
        ...rest,
        tags: Array.isArray(tags) ? tags : [],
        author_id: post.author_id,
        featured_image_url:
          featuredImageRemoved && !featuredImage ? null : post.featured_image_url,
      };
      if (typeof category_id === 'string' && category_id.length > 0) {
        updateObj.category_id = category_id;
      }
      await updatePost(
        id,
        updateObj,
        featuredImage
      );
      toast.success('Blog post updated successfully!');
      navigate('/admin/blog');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog post');
      console.error('Error updating blog post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-navy">Edit Blog Post</h1>
          <Link to="/admin/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Blog post not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Edit Blog Post</h1>
          <p className="text-gray-600 mt-2">Edit and update your blog post</p>
        </div>
        <Link to="/admin/blog">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Form */}
      <BlogPostForm
        initialData={post}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default BlogPostEdit;