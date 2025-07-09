import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useBlog, useBlogPosts } from '@/hooks/useBlog';
import type { BlogTag } from '@/types/blog';
import { deepSanitizeNulls } from '@/lib/utils';

const BlogTagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<BlogTag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { categories } = useBlog();
  const { tags } = useBlog();
  const { 
    posts, 
    loading, 
    error, 
    totalPages 
  } = useBlogPosts({ 
    tag: slug,
    published: true 
  }, currentPage, 6);

  const sanitizedPosts = deepSanitizeNulls(posts);
  const sanitizedCategories = deepSanitizeNulls(categories);
  const sanitizedTags = deepSanitizeNulls(tags);

  const fixedCategories = sanitizedCategories.map((cat: any) => ({...cat, description: cat.description ?? null}));
  const fixedPosts = sanitizedPosts.map((post: any) => ({
    ...post,
    excerpt: post.excerpt ?? null,
    featured_image_url: post.featured_image_url ?? null,
    category: post.category ?? null,
    category_id: post.category_id ?? null,
    author_name: post.author_name ?? null,
    author_id: post.author_id ?? null,
    reading_time_minutes: post.reading_time_minutes ?? null,
    seo_title: post.seo_title ?? null,
    seo_description: post.seo_description ?? null,
    meta_title: post.meta_title ?? null,
    meta_description: post.meta_description ?? null,
    meta_keywords: post.meta_keywords ?? null
  }));

  useEffect(() => {
    // Find tag by slug
    const foundTag = sanitizedTags.find((t: any) => t.slug === slug);
    setTag(foundTag || null);
  }, [slug, sanitizedTags]);

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

      <div className="min-h-screen bg-bg-primary py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tag Posts Grid */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center min-h-96">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : fixedPosts.length === 0 ? (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 mb-8">
                    {fixedPosts.map((post) => (
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
                categories={fixedCategories}
                tags={sanitizedTags}
                recentPosts={fixedPosts.slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogTagPage;