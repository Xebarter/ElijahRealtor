import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts, useBlog } from '@/hooks/useBlog';
import { deepSanitizeNulls } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, ArrowRight } from 'lucide-react';
import SEO from '@/components/common/SEO';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    published?: boolean;
    search?: string;
    category_slug?: string;
    tag_slug?: string;
  }>({});

  // Update filters when URL params change
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    
    setFilters({
      published: true,
      search: search || undefined,
      category_slug: category || undefined,
      tag_slug: tag || undefined,
    });
    setSearchQuery(search);
    setCurrentPage(1);
  }, [searchParams]);

  const { posts, loading } = useBlogPosts(filters, currentPage, 6);
  const { categories, tags } = useBlog();
  const [totalPages] = useState(5); // Default to 5 pages, adjust based on your API

  const sanitizedCategories = deepSanitizeNulls(categories);
  const sanitizedTags = deepSanitizeNulls(tags);

  const fixedCategories = sanitizedCategories.map((cat: any) => ({
    ...cat,
    description: cat.description ?? null
  }));

  // Get page title based on filters
  const getPageTitle = () => {
    if (filters.search) {
      return `Search Results: "${filters.search}"`;
    }
    
    if (filters.category_slug) {
      const category = fixedCategories.find((c: any) => c.slug === filters.category_slug);
      return category ? `Category: ${category.name}` : 'Blog';
    }
    
    if (filters.tag_slug) {
      const tag = sanitizedTags.find((t: any) => t.slug === filters.tag_slug);
      return tag ? `Tag: ${tag.name}` : 'Blog';
    }
    return 'Latest Articles';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    window.location.href = `/blog?${params.toString()}`;
  };

  const clearFilters = () => {
    window.location.href = '/blog';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={getPageTitle()} 
        description="Discover the latest insights, tips, and news about luxury real estate in Africa." 
      />
      
      {/* Hero Section */}
      <div className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cinzel">
              {getPageTitle()}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the latest insights, tips, and news about luxury real estate in Africa.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="flex-1 py-6 px-4 rounded-none border-2 border-[#ffd51e] text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="bg-[#ffd51e] text-black hover:bg-[#ffd51e]/90 rounded-none px-8 py-6"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
            
            {/* Active Filters */}
            {(filters.search || filters.category_slug || filters.tag_slug) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(filters.search || filters.category_slug || filters.tag_slug) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-white border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                )}
                {filters.search && (
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    Search: {filters.search}
                  </span>
                )}
                {filters.category_slug && (
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    Category: {fixedCategories.find((c: any) => c.slug === filters.category_slug)?.name}
                  </span>
                )}
                {filters.tag_slug && (
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    Tag: {sanitizedTags.find((t: any) => t.slug === filters.tag_slug)?.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Blog Posts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffd51e]"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post: any) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any articles matching your criteria.</p>
                <Button 
                  onClick={clearFilters}
                  className="bg-[#ffd51e] text-black hover:bg-[#ffd51e]/90"
                >
                  View All Articles
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {currentPage > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="border-gray-300"
                  >
                    Previous
                  </Button>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show current page and 2 pages before and after
                  let pageNum;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'outline'}
                      className={pageNum === currentPage ? 'bg-[#ffd51e] text-black hover:bg-[#ffd51e]/90' : 'border-gray-300'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {currentPage < totalPages && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="border-gray-300"
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            <BlogSidebar 
              categories={fixedCategories} 
              tags={sanitizedTags} 
              recentPosts={posts?.slice(0, 3) || []}
              onSearch={(query) => {
                setSearchQuery(query);
                window.location.href = `/blog?search=${encodeURIComponent(query)}`;
              }}
            />
            
            {/* Newsletter Signup */}
            <Card className="bg-[#f9f9f9] border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Subscribe to Our Newsletter</CardTitle>
                <p className="text-sm text-gray-600">Get the latest luxury property insights delivered to your inbox.</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-3">
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    className="border-gray-300 py-5"
                    required 
                  />
                  <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                    Subscribe <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;