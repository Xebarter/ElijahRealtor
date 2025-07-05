import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  X, 
  Plus,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { useAuthStore } from '@/store/auth';
import { generateSlug } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

// Form validation schema
const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug is required'),
  content: z.string().min(10, 'Content is required'),
  excerpt: z.string().optional(),
  category_id: z.string().optional(),
  author_name: z.string().min(2, 'Author name is required'),
  tags: z.array(z.string()).optional(),
  published: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.array(z.string()).optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>;
  onSubmit: (data: BlogPostFormData, featuredImageRemoved: boolean, featuredImage?: File) => Promise<void>;
  isSubmitting: boolean;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}) => {
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(
    initialData?.featured_image_url || null
  );
  const [featuredImageRemoved, setFeaturedImageRemoved] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();
  const { user } = useAuthStore();

  // Debug: log categories and tags
  console.log('categories', categories);
  console.log('tags', tags);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      category_id: initialData?.category_id || undefined,
      author_name: initialData?.author_name || user?.user_metadata?.full_name || 'Admin',
      tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
      published: initialData?.published !== undefined ? initialData.published : false,
      meta_title: initialData?.seo_title || '',
      meta_description: initialData?.seo_description || '',
      meta_keywords: Array.isArray(initialData?.meta_keywords) ? initialData.meta_keywords : [],
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const watchedTags = watch('tags') || [];
  const watchedPublished = watch('published');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && (!watchedSlug || watchedSlug === '')) {
      setValue('slug', generateSlug(watchedTitle));
    }
  }, [watchedTitle, watchedSlug, setValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFeaturedImage(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImageRemoved(true);
    if (featuredImagePreview && !initialData?.featured_image_url) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImagePreview(null);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = getValues('tags') || [];
      if (!currentTags.includes(tagInput.trim())) {
        setValue('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = getValues('tags') || [];
    setValue('tags', currentTags.filter(t => t !== tag));
  };

  const selectExistingTag = (tagName: string) => {
    const currentTags = getValues('tags') || [];
    if (!currentTags.includes(tagName)) {
      setValue('tags', [...currentTags, tagName]);
    }
  };

  const handleFormSubmit = async (data: BlogPostFormData) => {
    try {
      setUploadProgress(0);
      // Ensure tags and meta_keywords are always arrays
      const safeData = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        meta_keywords: Array.isArray(data.meta_keywords) ? data.meta_keywords : [],
      };
      await onSubmit(safeData, featuredImageRemoved, featuredImage || undefined);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title and Slug */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              {...register('title')}
              placeholder="Enter post title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <div className="flex gap-2">
              <Input
                {...register('slug')}
                placeholder="url-friendly-slug"
                className={errors.slug ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue('slug', generateSlug(watchedTitle))}
              >
                Generate
              </Button>
            </div>
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This will be used in the URL: https://example.com/blog/<span className="font-mono">{watchedSlug || 'your-slug'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.filter(category => category.id && category.id !== '').map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <Input
                {...register('author_name')}
                placeholder="Author name"
                className={errors.author_name ? 'border-red-500' : ''}
              />
              {errors.author_name && (
                <p className="text-red-500 text-sm mt-1">{errors.author_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Published
              </label>
              <Switch
                checked={watchedPublished}
                onCheckedChange={(checked) => setValue('published', checked)}
              />
            </div>
            <p className="text-xs text-gray-500">
              {watchedPublished 
                ? 'This post will be visible to the public' 
                : 'This post will be saved as a draft'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-gold" />
            Featured Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredImagePreview ? (
            <div className="relative">
              <img
                src={featuredImagePreview}
                alt="Featured"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeFeaturedImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-gold transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Click to upload a featured image
              </p>
              <p className="text-xs text-gray-500">
                Recommended size: 1200 x 630 pixels (16:9 ratio)
              </p>
              <p className="text-xs text-gray-500">
                Max file size: 5MB
              </p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-gold" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <Textarea
              {...register('excerpt')}
              placeholder="Brief summary of the post (optional)"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed on the blog index page and in search results
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <Textarea
              {...register('content')}
              placeholder="Write your blog post content here..."
              rows={15}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown formatting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-primary-gold" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Existing tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const hasPostCount = typeof (tag as any)?.post_count === 'number';
                  return (
                    <Badge
                      key={tag.id}
                      variant={watchedTags.includes(tag.name) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => selectExistingTag(tag.name)}
                    >
                      {tag.name}
                      {hasPostCount && (
                        <span className="ml-1 text-xs">({(tag as any)?.post_count})</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected tags */}
          {watchedTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-xs hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <Input
              {...register('meta_title')}
              placeholder="SEO title (defaults to post title if empty)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended length: 50-60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <Textarea
              {...register('meta_description')}
              placeholder="SEO description (defaults to excerpt if empty)"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended length: 150-160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData?.id ? 'Update' : 'Publish'} Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;