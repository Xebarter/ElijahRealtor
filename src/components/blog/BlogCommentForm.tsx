import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlogComments } from '@/hooks/useBlog';

const commentSchema = z.object({
  author_name: z.string().min(2, 'Name is required'),
  author_email: z.string().email('Valid email is required'),
  content: z.string().min(10, 'Comment must be at least 10 characters'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface BlogCommentFormProps {
  postId: string;
  onCommentSubmitted?: () => void;
}

const BlogCommentForm: React.FC<BlogCommentFormProps> = ({ postId, onCommentSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment } = useBlogComments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await createComment({
        post_id: postId,
        author_name: data.author_name,
        author_email: data.author_email,
        content: data.content,
      });
      
      reset();
      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary-gold" />
          Leave a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                {...register('author_name')}
                placeholder="Your name"
                className={errors.author_name ? 'border-red-500' : ''}
              />
              {errors.author_name && (
                <p className="text-red-500 text-sm mt-1">{errors.author_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email * (will not be published)
              </label>
              <Input
                type="email"
                {...register('author_email')}
                placeholder="Your email"
                className={errors.author_email ? 'border-red-500' : ''}
              />
              {errors.author_email && (
                <p className="text-red-500 text-sm mt-1">{errors.author_email.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment *
            </label>
            <Textarea
              {...register('content')}
              placeholder="Your comment"
              rows={4}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p>Your comment will be reviewed before it appears on the site.</p>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogCommentForm;