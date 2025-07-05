import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, MessageSquare, FileText, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogPostTable from '@/components/admin/blog/BlogPostTable';
import CategoryTagManager from '@/components/admin/blog/CategoryTagManager';
import BlogCommentManager from '@/components/admin/blog/BlogCommentManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBlogPosts, useBlogStats } from '@/hooks/useBlog';
import type { BlogPost } from '@/types/blog';

const BlogManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { 
    posts, 
    loading, 
    error
  } = useBlogPosts({ published: undefined });
  
  const { stats, loading: statsLoading } = useBlogStats();

  const handleEditPost = (post: BlogPost) => {
    navigate(`/admin/blog/edit/${post.id}`);
  };

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-primary-navy">
                  {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.totalPosts}
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
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.publishedPosts}
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
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statsLoading ? <LoadingSpinner size="sm" as="span" className="align-middle" /> : stats.totalComments}
                </p>
                {stats.pendingComments > 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    {stats.pendingComments} pending
                  </p>
                )}
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
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
            {stats.pendingComments > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {stats.pendingComments}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <BlogPostTable
            onEdit={handleEditPost}
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
  );
};

export default BlogManagement;