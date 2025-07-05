import { useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useBlogPosts, useBlog } from '@/hooks/useBlog';
import type { BlogPost, BlogFilters } from '@/types/blog';

interface BlogPostTableProps {
  onEdit: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
  onTogglePublish?: (post: BlogPost) => void;
}

const BlogPostTable: React.FC<BlogPostTableProps> = ({ 
  onEdit, 
  onDelete,
  onTogglePublish
}) => {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { posts, loading, error } = useBlogPosts(filters, currentPage, 10);
  const { categories } = useBlog();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters({ ...filters, category_id: categoryId === 'all' ? undefined : categoryId });
    setCurrentPage(1);
  };

  const handlePublishedFilter = (value: string) => {
    setFilters({ 
      ...filters, 
      published: value === 'all' ? undefined : value === 'published'
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const confirmDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedPost && onDelete) {
      onDelete(selectedPost);
      setShowDeleteDialog(false);
      setSelectedPost(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                name="search"
                placeholder="Search posts..."
                defaultValue={filters.search || ''}
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            
            <Select
              value={filters.category_id || 'all'}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={
                filters.published === undefined 
                  ? 'all' 
                  : filters.published 
                    ? 'published' 
                    : 'draft'
              }
              onValueChange={handlePublishedFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(filters.search || filters.category_id || filters.published !== undefined) && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Author</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-start space-x-3">
                          {post.featured_image_url && (
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-primary-navy">{post.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {post.slug}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {post.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{post.author_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {post.category || '-'}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={post.published ? 'default' : 'secondary'}
                          className={post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {onTogglePublish && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onTogglePublish(post)}
                            >
                              {post.published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmDelete(post)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPostTable;