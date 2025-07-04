import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useBlogPosts, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import type { BlogTag } from '@/types/blog';

const BlogTagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<BlogTag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();
  const { 
    posts, 
    loading, 
    error, 
    totalPages 
  } = useBlogPosts({ 
    tag_slug: slug,
    published: true 
  }, currentPage, 6);

  useEffect(() => {
    // Find tag by slug
    const foundTag = tags.find(t => t.slug === slug);
    setTag(foundTag || null);
  }, [slug, tags]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title={tag ? `${tag.name} | Blog` : 'Tag | Blog'}
        description={`Browse blog posts tagged with ${tag?.name || 'this tag'}`}
        keywords={`blog, ${tag?.name}, real estate, property`}
      />

      <div className="min-h-screen bg-bg-primary">
        {/* Hero Section */}
        <div className="bg-primary-navy text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center bg-white/10 p-3 rounded-full mb-4">
              <TagIcon className="w-8 h-8 text-primary-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {tag ? `Tag: ${tag.name}` : 'Tag'}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Browse all articles related to this topic
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back to Blog */}
          <Link to="/blog" className="inline-flex items-center text-primary-navy hover:text-primary-gold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center min-h-96">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">No Posts Found</h2>
                  <p className="text-gray-500 mb-6">
                    There are no posts with this tag yet.
                  </p>
                  <Link to="/blog">
                    <Button className="btn-primary">
                      View All Posts
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {posts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          className={currentPage === page ? 'bg-primary-navy' : ''}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Sidebar */}
            <div>
              <BlogSidebar
                categories={categories}
                tags={tags}
                recentPosts={posts.slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogTagPage;