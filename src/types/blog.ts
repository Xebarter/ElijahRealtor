// Blog system types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  category_id: string | null;
  author_name: string | null;
  author_id: string | null;
  tags: string[];
  tag_objects?: BlogTag[];
  published: boolean;
  reading_time_minutes: number | null;
  view_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  post_count?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Form types
export interface BlogPostForm {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: File;
  featured_image_url?: string | null;
  category_id?: string | null;
  author_name: string;
  tags: string[];
  published: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
}

export interface BlogCategoryForm {
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTagForm {
  name: string;
  slug: string;
}

export interface BlogCommentForm {
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
}

// Filter and pagination types
export interface BlogFilters {
  search?: string;
  category_id?: string;
  category_slug?: string;
  tag_id?: string;
  tag_slug?: string;
  author_id?: string;
  published?: boolean;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_categories: number;
  total_tags: number;
  total_comments: number;
  pending_comments: number;
}