import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import type { BlogFilters } from '@/types/blog';
import { deepSanitizeNulls } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BlogFilters>({});

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
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/4">
        {/* Add BlogSidebar component */}
      </div>
      <div className="md:w-3/4">
        <h1>{getPageTitle()}</h1>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <Input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="md:w-1/2">
            {/* Add category and tag filters */}
          </div>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            {/* Add pagination controls */}
          </div>
          <div className="md:w-1/2">
            {/* Add sorting controls */}
          </div>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Add blog post cards */}
        </div>
      </div>
    </div>
  );
};

export default Blog;