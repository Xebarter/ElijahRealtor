import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import { useBlogPosts, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import type { BlogFilters } from '@/types/blog';
import { deepSanitizeNulls } from '@/lib/utils';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BlogFilters>({
    published: true,
    search: searchParams.get('search') || undefined,
    category_slug: searchParams.get('category') || undefined,
    tag_slug: searchParams.get('tag') || undefined,
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      published: true,
      search: searchParams.get('search') || undefined,
      category_slug: searchParams.get('category') || undefined,
      tag_slug: searchParams.get('tag') || undefined,
    });
    setCurrentPage(1);
  }, [searchParams]);

  const { 
    posts, 
    loading, 
    error, 
    totalPages 
  } = useBlogPosts(filters, currentPage, 6);
  
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

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.delete('category');
    params.delete('tag');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get page title based on filters
  const getPageTitle = () => {
    if (filters.search) {
      return `Search Results: ${filters.search}`;
    }
    
    if (filters.category_slug) {
      const category = fixedCategories.find(c => c.slug === filters.category_slug);
      return category ? `Category: ${category.name}` : 'Blog';
    }
    
    if (filters.tag_slug) {
      const tag = sanitizedTags.find(t => t.slug === filters.tag_slug);
      return tag ? `Tag: ${tag.name}` : 'Blog';
    }
    
    return 'Blog';
  };

  return (
    <>
      <SEO
        title="Blog | ElijahRealtor"
        description="Explore our blog for the latest insights, tips, and news about real estate across Africa. Expert advice on buying, selling, and investing in property."
        keywords="real estate blog, property tips, investment advice, African real estate, market insights"
      />

      <div className="min-h-screen bg-bg-primary">
        {/* Hero Section */}
        <div className="bg-primary-navy text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{getPageTitle()}</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Insights, tips, and news about real estate across Africa
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  defaultValue={filters.search}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              ) : fixedPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">No Posts Found</h2>
                    <p className="text-gray-500 mb-6">
                      {filters.search 
                        ? `No results found for "${filters.search}". Try a different search term.` 
                        : filters.category_slug 
                          ? 'No posts in this category yet.' 
                          : filters.tag_slug 
                            ? 'No posts with this tag yet.' 
                            : 'No blog posts available yet.'}
                    </p>
                    <Button onClick={() => setSearchParams({})}>
                      View All Posts
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;