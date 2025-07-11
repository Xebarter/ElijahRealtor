import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, MessageSquare, FileText, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogPostTable from '@/components/admin/blog/BlogPostTable';
import CategoryTagManager from '@/components/admin/blog/CategoryTagManager';
import BlogCommentManager from '@/components/admin/blog/BlogCommentManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBlogStats, useBlogPosts } from '@/hooks/useBlog';
import type { BlogPost } from '@/types/blog';
import toast from 'react-hot-toast';

const BlogManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { stats, loading: statsLoading, fetchStats } = useBlogStats();
  const { updatePost, deletePost } = useBlogPosts();

  const handleEditPost = (post: BlogPost) => {
    navigate(`/admin/blog/edit/${post.id}`);
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      await deletePost(post.id);
      toast.success('Blog post deleted successfully!');
      // Refresh stats after deletion
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog post');
      console.error('Error deleting blog post:', error);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await updatePost(post.id, { published: !post.published });
      toast.success(`Blog post ${post.published ? 'unpublished' : 'published'} successfully!`);
      // Refresh stats after status change
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog post status');
      console.error('Error updating blog post status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">Blog Management</h1>
            <p className="text-gray-600 mt-2">Create and manage blog content, categories, tags, and comments</p>
          </div>
          <Link to="/admin/blog/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-3xl font-bold text-primary-navy">
                    {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.total_posts}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Posts</p>
                  <p className="text-3xl font-bold text-primary-navy">
                    {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.published_posts}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Comments</p>
                  <p className="text-3xl font-bold text-primary-navy">
                    {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.total_comments}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Comments</p>
                  <p className="text-3xl font-bold text-primary-navy">
                    {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.pending_comments}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <Layers className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mt-6">
            <TabsTrigger value="posts" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Categories & Tags
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
              {stats.pending_comments > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {stats.pending_comments}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <BlogPostTable
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onTogglePublish={handleTogglePublish}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryTagManager />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <BlogCommentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlogManagement;