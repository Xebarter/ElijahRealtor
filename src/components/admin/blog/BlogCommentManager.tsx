import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  Mail, 
  Calendar, 
  FileText,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useAllBlogComments } from '@/hooks/useBlog';
import type { BlogComment } from '@/types/blog';

const BlogCommentManager: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>('pending');
  const [selectedComment, setSelectedComment] = useState<BlogComment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { 
    comments, 
    loading, 
    error, 
    updateCommentStatus, 
    deleteComment 
  } = useAllBlogComments(statusFilter);

  const handleStatusChange = (status: 'pending' | 'approved' | 'rejected' | 'all') => {
    setStatusFilter(status === 'all' ? undefined : status);
  };

  const confirmDelete = (comment: BlogComment) => {
    setSelectedComment(comment);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedComment) return;
    
    try {
      await deleteComment(selectedComment.id);
      setShowDeleteDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value: any) => handleStatusChange(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Comments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-gold" />
            Blog Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No comments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="border-l-4 border-primary-gold">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                      <div className="flex items-center mb-2 md:mb-0">
                        <div className="w-8 h-8 bg-primary-gold/10 rounded-full flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-primary-gold" />
                        </div>
                        <div>
                          <div className="font-medium">{comment.author_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {comment.author_email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            On: {comment.post_title || 'Unknown Post'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        {getStatusBadge(comment.status)}
                      </div>
                      <div className="flex gap-2">
                        {comment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => updateCommentStatus(comment.id, 'approved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => updateCommentStatus(comment.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {comment.status === 'rejected' && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => updateCommentStatus(comment.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {comment.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => updateCommentStatus(comment.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDelete(comment)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this comment? This action cannot be undone.
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

export default BlogCommentManager;