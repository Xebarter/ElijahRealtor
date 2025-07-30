import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Clock, ArrowRight } from 'lucide-react';
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group ${className}`}
    >
      {/* Featured Image */}
      {post.featured_image_url && (
        <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`} className="block overflow-hidden">
          <div className="aspect-video overflow-hidden relative">
            <img
              src={post.featured_image_url}
              alt={post.title || 'Blog post image'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-white text-sm font-medium bg-[#ffd51e] text-black px-3 py-1 rounded-full">
                Read Article
              </span>
            </div>
          </div>
        </Link>
      )}
      
      <CardContent className="p-6">
        {/* Category */}
        {post.category && (
          <Link to={`/blog/category/${post.category}`}>
            <Badge 
              variant="outline" 
              className="mb-3 text-[#ffd51e] border-[#ffd51e] bg-[#ffd51e]/10 hover:bg-[#ffd51e]/20 transition-colors font-normal"
            >
              {post.category}
            </Badge>
          </Link>
        )}
        
        {/* Title */}
        <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`}>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-[#ffd51e] transition-colors font-cinzel">
            {post.title || 'Untitled'}
          </h3>
        </Link>
        
        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-[#ffd51e]" />
            <span className="text-gray-600">{formatDate(post.created_at)}</span>
          </div>
          
          {post.author_name && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5 text-[#ffd51e]" />
              <span className="text-gray-600">{post.author_name}</span>
            </div>
          )}
          
          {post.reading_time_minutes && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-[#ffd51e]" />
              <span className="text-gray-600">{post.reading_time_minutes} min read</span>
            </div>
          )}
        </div>
        
        {/* Excerpt */}
        {!compact && post.excerpt && (
          <p className="text-gray-600 mb-5 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        {/* Tags */}
        {!compact && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs"
              >
                <Tag className="w-3 h-3 mr-1 text-[#ffd51e]" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Read More Button */}
        <div className="mt-4">
          <Button 
            variant="link" 
            className="p-0 h-auto text-[#ffd51e] hover:text-[#e6c01a] font-medium flex items-center group"
            asChild
          >
            <Link to={`/blog/${post.slug || generateSlug(post.title || 'Untitled')}`}>
              Read more
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;