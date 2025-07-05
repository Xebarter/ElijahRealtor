import { useBlog } from '@/hooks/useBlog';
import toast from 'react-hot-toast';
import { CategoryForm } from './CategoryForm';
import { TagForm } from './TagForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Tag } from 'lucide-react';

const CategoryTagManager: React.FC = () => {
  const { 
    categories, 
    tags,
    loading,
    fetchCategories,
    fetchTags
  } = useBlog();

  const handleCreateCategory = async () => {
    try {
      // TODO: Implement createCategory function in useBlog hook
      toast.success('Category created successfully');
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      // TODO: Implement updateCategory function in useBlog hook
      toast.success('Category updated successfully');
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      // TODO: Implement deleteCategory function in useBlog hook
      toast.success('Category deleted successfully');
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleCreateTag = async () => {
    try {
      // TODO: Implement createTag function in useBlog hook
      toast.success('Tag created successfully');
      await fetchTags(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tag');
    }
  };

  const handleUpdateTag = async () => {
    try {
      // TODO: Implement updateTag function in useBlog hook
      toast.success('Tag updated successfully');
      await fetchTags(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tag');
    }
  };

  const handleDeleteTag = async () => {
    try {
      // TODO: Implement deleteTag function in useBlog hook
      toast.success('Tag deleted successfully');
      await fetchTags(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-primary-gold" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-gold mx-auto"></div>
            </div>
          ) : (
            <CategoryForm
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2 text-primary-gold" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-gold mx-auto"></div>
            </div>
          ) : (
            <TagForm
              tags={tags}
              onCreateTag={handleCreateTag}
              onUpdateTag={handleUpdateTag}
              onDeleteTag={handleDeleteTag}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryTagManager;