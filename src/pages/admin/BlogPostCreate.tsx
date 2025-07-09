import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import { useBlogPosts } from '@/hooks/useBlog';
import toast from 'react-hot-toast';

const BlogPostCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost } = useBlogPosts();

  const handleSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createPost({
        title: data.title,
        slug: data.slug,
        content: data.content,
        published: data.published,
        author_name: data.author_name,
        excerpt: data.excerpt || undefined,
        tags: data.tags || [],
        category: data.category_id || undefined,
        seo_title: data.meta_title || undefined,
        seo_description: data.meta_description || undefined,
        meta_keywords: data.meta_keywords || []
      });
      
      toast.success('Blog post created successfully!');
      navigate('/admin/blog');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create blog post');
      console.error('Error creating blog post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">Create New Blog Post</h1>
            <p className="text-gray-600 mt-2">Create and publish a new blog post</p>
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
          onSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default BlogPostCreate;