import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Eye, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateSlug } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  compact?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, className = '', compact = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      {/* Featured Image */}
      {post.featured_image_url && (
        <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`} className="block overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg';
              }}
            />
          </div>
        </Link>
      )}
      
      <CardContent className="p-5">
        {/* Category */}
        {post.category && (
          <Link to={`/blog/category/${post.category}`}>
            <Badge variant="outline" className="mb-2 text-primary-gold border-primary-gold">
              {post.category}
            </Badge>
          </Link>
        )}
        
        {/* Title */}
        <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`}>
          <h3 className="text-xl font-semibold text-primary-navy mb-2 hover:text-primary-gold transition-colors">
            {post.title || 'Untitled'}
          </h3>
        </Link>
        
        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          {post.author_name && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{post.author_name}</span>
            </div>
          )}
          
          {post.reading_time_minutes && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.reading_time_minutes} min read</span>
            </div>
          )}
          
          {post.view_count !== undefined && (
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{post.view_count} views</span>
            </div>
          )}
        </div>
        
        {/* Excerpt */}
        {!compact && post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        {/* Tags */}
        {!compact && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Read More Button */}
        {!compact && (
          <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`}>
            <Button variant="outline" className="mt-2">
              Read More
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogCard;