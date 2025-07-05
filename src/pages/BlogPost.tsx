import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag as TagIcon, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogCommentForm from '@/components/blog/BlogCommentForm';
import BlogCommentList from '@/components/blog/BlogCommentList';
import BlogCard from '@/components/blog/BlogCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useBlogPosts, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { generateSlug, deepSanitizeNulls } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import type { BlogPost } from '@/types/blog';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  
  const { getPostBySlug, posts } = useBlogPosts({ published: true });
  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();

  const sanitizedPosts = deepSanitizeNulls(posts);
  const sanitizedCategories = deepSanitizeNulls(categories);
  const sanitizedTags = deepSanitizeNulls(tags);

  const fixedCategories = sanitizedCategories.map(cat => ({
    ...cat,
    description: cat.description ?? undefined
  }));
  const fixedPosts = sanitizedPosts.map(post => ({
    ...post,
    excerpt: post.excerpt ?? undefined,
    featured_image_url: post.featured_image_url ?? undefined,
    category: post.category ?? undefined,
    category_id: post.category_id ?? undefined,
    author_name: post.author_name ?? undefined,
    author_id: post.author_id ?? undefined,
    reading_time_minutes: post.reading_time_minutes ?? undefined,
    seo_title: post.seo_title ?? undefined,
    seo_description: post.seo_description ?? undefined,
    meta_title: post.meta_title ?? undefined,
    meta_description: post.meta_description ?? undefined,
    meta_keywords: post.meta_keywords ?? undefined
  }));

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedPost = await getPostBySlug(slug);
        
        if (!fetchedPost) {
          setError('Blog post not found');
          return;
        }
        
        setPost(fetchedPost);
        
        // Find related posts (same category or tags)
        if (sanitizedPosts.length > 0) {
          const related = sanitizedPosts.filter(p => 
            p.id !== fetchedPost.id && (
              p.category_id === fetchedPost.category_id ||
              p.tags?.some(tag => fetchedPost.tags?.includes(tag))
            )
          ).slice(0, 3);
          
          setRelatedPosts(related);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch blog post');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug, getPostBySlug, sanitizedPosts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Blog Post Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'The blog post you are looking for does not exist or has been removed.'}</p>
            <Link to="/blog">
              <Button className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt || `Read ${post.title} on ElijahRealtor Blog`}
        keywords={post.meta_keywords?.join(', ') || 'real estate, blog, property'}
        image={post.featured_image_url}
        type="article"
      />

      <div className="min-h-screen bg-bg-primary">
        {/* Hero Section */}
        <div className="relative">
          {post.featured_image_url ? (
            <div className="h-96 relative">
              <div className="absolute inset-0 bg-black/50"></div>
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                  {post.excerpt && (
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-6">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    
                    {post.author_name && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{post.author_name}</span>
                      </div>
                    )}
                    
                    {post.reading_time_minutes && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{post.reading_time_minutes} min read</span>
                      </div>
                    )}
                    
                    {post.view_count !== undefined && (
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{post.view_count} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary-navy text-white py-16">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                {post.excerpt && (
                  <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-6">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  
                  {post.author_name && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.author_name}</span>
                    </div>
                  )}
                  
                  {post.reading_time_minutes && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.reading_time_minutes} min read</span>
                    </div>
                  )}
                  
                  {post.view_count !== undefined && (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{post.view_count} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back to Blog */}
              <Link to="/blog" className="inline-flex items-center text-primary-navy hover:text-primary-gold transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
              
              {/* Post Content */}
              <Card>
                <CardContent className="p-8">
                  {/* Category */}
                  {post.category && (
                    <Link to={`/blog/category/${typeof post.category === 'object' && post.category !== null && 'slug' in post.category ? post.category.slug ?? '' : ''}`}>
                      <Badge variant="outline" className="mb-4 text-primary-gold border-primary-gold">
                        {typeof post.category === 'object' && post.category !== null && 'name' in post.category ? post.category.name ?? '' : ''}
                      </Badge>
                    </Link>
                  )}
                  
                  {/* Content */}
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700 mr-2">Tags:</span>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <Link key={index} to={`/blog/tag/${tag || generateSlug(tag || '')}`}>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                {tag}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Comments */}
              <div className="space-y-6">
                <BlogCommentList postId={post.id} />
                <BlogCommentForm postId={post.id} />
              </div>
              
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-primary-navy">Related Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <BlogCard key={relatedPost.id} post={relatedPost} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div>
              <BlogSidebar
                categories={fixedCategories}
                tags={sanitizedTags}
                recentPosts={sanitizedPosts.filter(p => p.id !== post.id).slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;