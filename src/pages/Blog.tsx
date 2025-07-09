import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts, useBlog } from '@/hooks/useBlog';
import { deepSanitizeNulls } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
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

  const { posts, loading } = useBlogPosts(filters, currentPage, 9);
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

  if (loading) {
  return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Posts Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 mb-8">
              {sanitizedPosts.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No blog posts found.</div>
              ) : (
                sanitizedPosts.map((post: any) => (
                  <BlogCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div>
            <BlogSidebar
              categories={sanitizedCategories}
              tags={sanitizedTags}
              recentPosts={recentPosts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;