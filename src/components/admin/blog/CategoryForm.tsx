import React, { useState } from 'react';
import { Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { generateSlug } from '@/lib/utils';
import type { BlogCategory } from '@/types/blog';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  categories: BlogCategory[];
  onCreateCategory: (data: { name: string; slug: string; description?: string }) => Promise<void>;
  onUpdateCategory: (id: string, data: { name: string; slug: string; description?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setShowDialog(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setShowDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, { 
          name: categoryName, 
          slug: generateSlug(categoryName),
          description: categoryDescription || undefined
        });
        toast.success('Category updated successfully');
      } else {
        await onCreateCategory({ 
          name: categoryName, 
          slug: generateSlug(categoryName),
          description: categoryDescription || undefined
        });
        toast.success('Category created successfully');
      }
      setShowDialog(false);
      setCategoryName('');
      setCategoryDescription('');
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category: BlogCategory) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      toast.success('Category deleted successfully');
      setShowDeleteDialog(false);
      setDeletingCategory(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No categories found
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <FolderOpen className="w-4 h-4 text-primary-gold flex-shrink-0" />
                    <Badge variant="secondary" className="font-medium">
                      {category.name}
                    </Badge>
                    {category.post_count !== undefined && (
                      <span className="text-xs text-gray-500">
                        ({category.post_count} posts)
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-1 ml-6">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddCategory}
          className="w-full"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      {/* Category Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSubmitting}
              />
              {categoryName && (
                <p className="text-xs text-gray-500 mt-1">
                  Slug: {generateSlug(categoryName)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Enter category description (optional)"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!categoryName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the category "{deletingCategory?.name}"?
            {deletingCategory?.post_count && deletingCategory.post_count > 0 && (
              <span className="block text-sm text-red-600 mt-1">
                This category is used in {deletingCategory.post_count} post(s).
              </span>
            )}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 