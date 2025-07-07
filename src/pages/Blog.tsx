import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBlogPosts, useBlog } from '@/hooks/useBlog';
import { deepSanitizeNulls } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<{
    published?: boolean;
    search?: string;
    category?: string;
    tag?: string;
  }>({});

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      published: true,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
    });
    setCurrentPage(1);
  }, [searchParams]);

  const { posts, loading, error, totalPages } = useBlogPosts(filters, currentPage, 9);
  const { categories, tags, getRecentPosts } = useBlog();

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const sanitizedCategories = deepSanitizeNulls(categories);
  const sanitizedTags = deepSanitizeNulls(tags);
  const sanitizedPosts = deepSanitizeNulls(posts);

  // Fetch recent posts for sidebar
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const recent = await getRecentPosts(5);
        setRecentPosts(recent);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };
    fetchRecentPosts();
  }, [getRecentPosts]);

  // Get page title based on filters
  const getPageTitle = () => {
    if (filters.search) {
      return `Search Results: ${filters.search}`;
    }
    
    if (filters.category) {
      const category = sanitizedCategories.find((c: any) => c.id === filters.category);
      return category ? `Category: ${category.name}` : 'Blog';
    }
    
    if (filters.tag) {
      const tag = sanitizedTags.find((t: any) => t.id === filters.tag);
      return tag ? `Tag: ${tag.name}` : 'Blog';
    }
    return 'Blog';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryFilter = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== "all") {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-navy mb-4">{getPageTitle()}</h1>
          <p className="text-gray-600">
            Discover insights, tips, and trends in African real estate
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        placeholder="Search blog posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        Search
                      </Button>
                    </form>
                  </div>

                  {/* Category Filter */}
                  <div className="md:w-48">
                    <Select
                      value={filters.category || "all"}
                      onValueChange={handleCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {sanitizedCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                  </div>
                </div>

                {/* Active Filters */}
                {(filters.search || filters.category || filters.tag) && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {filters.search && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Search: {filters.search}
                      </span>
                    )}
                    {filters.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Category: {sanitizedCategories.find((c: any) => c.id === filters.category)?.name}
                      </span>
                    )}
                    {filters.tag && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Tag: {sanitizedTags.find((t: any) => t.id === filters.tag)?.name}
                      </span>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blog Posts */}
            {error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-500">Error loading blog posts: {error}</p>
                </CardContent>
              </Card>
            ) : sanitizedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No blog posts found.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {sanitizedPosts.map((post: any) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      compact={viewMode === 'list'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
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
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <BlogSidebar
              categories={sanitizedCategories}
              tags={sanitizedTags}
              recentPosts={recentPosts}
              onSearch={(query) => {
                setSearchQuery(query);
                const params = new URLSearchParams(searchParams);
                params.set('search', query);
                setSearchParams(params);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;