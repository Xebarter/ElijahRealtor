import { Calendar, User, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useBlogComments } from '@/hooks/useBlog';

const BlogCommentList: React.FC = () => {
  const { comments, loading, error } = useBlogComments();

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Error loading comments: {error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary-navy flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-primary-gold" />
        Comments ({comments.length})
      </h3>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="border-l-4 border-primary-gold">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold text-primary-navy">{comment.author_name}</h4>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogCommentList;