import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts, useBlog } from '@/hooks/useBlog';
import { deepSanitizeNulls } from '@/lib/utils';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    published?: boolean;
    search?: string;
    category_slug?: string;
    tag_slug?: string;
  }>({});

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

  const { posts } = useBlogPosts(filters, currentPage, 6);
  const { categories, tags } = useBlog();

  const sanitizedCategories = deepSanitizeNulls(categories);
  const sanitizedTags = deepSanitizeNulls(tags);

  const fixedCategories = sanitizedCategories.map((cat: any) => ({
    ...cat,
    description: cat.description ?? null
  }));

  // Get page title based on filters
  const getPageTitle = () => {
    if (filters.search) {
      return `Search Results: ${filters.search}`;
    }
    
    if (filters.category_slug) {
      const category = fixedCategories.find((c: any) => c.slug === filters.category_slug);
      return category ? `Category: ${category.name}` : 'Blog';
    }
    
    if (filters.tag_slug) {
      const tag = sanitizedTags.find((t: any) => t.slug === filters.tag_slug);
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
            {/* Add search input */}
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