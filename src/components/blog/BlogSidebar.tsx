import { Link } from 'react-router-dom';
import { Search, Tag, FolderOpen, Clock, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogCategory, BlogTag, BlogPost } from '@/types/blog';

interface BlogSidebarProps {
  categories?: BlogCategory[];
  tags?: BlogTag[];
  recentPosts?: BlogPost[];
  onSearch?: (query: string) => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ 
  categories = [], 
  tags = [], 
  recentPosts = [],
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-primary-gold" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search blog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-primary-gold" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/blog/category/${category.slug}`}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-gray-700 group-hover:text-primary-gold transition-colors">
                      {category.name}
                    </span>
                    {category.post_count !== undefined && (
                      <Badge variant="outline">{category.post_count}</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-gold" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentPosts.map((post) => (
                <li key={post.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="group"
                  >
                    <h4 className="font-medium text-gray-800 group-hover:text-primary-gold transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(post.created_at ?? '').toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary-gold" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                  <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 transition-colors">
                    {tag.name}
                    {tag.post_count !== undefined && (
                      <span className="ml-1 text-xs">({tag.post_count})</span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogSidebar;