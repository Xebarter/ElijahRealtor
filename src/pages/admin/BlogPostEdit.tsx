import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBlog, useBlogPost } from '@/hooks/useBlog';
import toast from 'react-hot-toast';

// Define the form data type to match what BlogPostForm expects
type BlogPostFormData = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id?: string;
  author_name: string;
  tags?: string[];
  published: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
};

const BlogPostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePost } = useBlog();
  const { post, loading, error } = useBlogPost(id);

  const handleSubmit = async (
    data: BlogPostFormData,
    featuredImageRemoved: boolean,
    featuredImage?: File
  ) => {
    if (!id || !post) return;
    setIsSubmitting(true);
    try {
      const { category_id, tags = [], ...rest } = data;
      const updateObj: any = {
        ...rest,
        tags: tags || [],
        author_id: post.author_id,
        featured_image_url:
          featuredImageRemoved && !featuredImage ? null : post.featured_image_url,
      };
      if (typeof category_id === 'string' && category_id.length > 0) {
        updateObj.category_id = category_id;
      }
      await updatePost(id, {
        title: data.title,
        slug: data.slug,
        content: data.content,
        published: data.published,
        author_name: data.author_name,
        excerpt: data.excerpt,
        tags: tags || [],
        category_id: data.category_id,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords || []
      });
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
    <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
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
      </div>
    </div>
  );
};

export default BlogPostEdit;