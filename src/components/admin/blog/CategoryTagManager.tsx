import { useState } from 'react';
import { 
  FolderOpen, 
  Tag as TagIcon, 
  Plus, 
  Edit, 
  Trash2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { generateSlug } from '@/lib/utils';
import type { BlogCategory, BlogTag } from '@/types/blog';

const CategoryTagManager: React.FC = () => {
  // Category state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  
  // Tag state
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [deletingTag, setDeletingTag] = useState<BlogTag | null>(null);
  const [showDeleteTagDialog, setShowDeleteTagDialog] = useState(false);
  
  const { 
    categories, 
    loading: categoriesLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useBlogCategories();
  
  const { 
    tags, 
    loading: tagsLoading, 
    createTag, 
    updateTag, 
    deleteTag 
  } = useBlogTags();

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? '');
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName, categoryDescription);
      } else {
        await createCategory(categoryName, categoryDescription);
      }
      setShowCategoryDialog(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = (category: BlogCategory) => {
    setDeletingCategory(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      setShowDeleteCategoryDialog(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Tag handlers
  const handleAddTag = () => {
    setEditingTag(null);
    setTagName('');
    setShowTagDialog(true);
  };

  const handleEditTag = (tag: BlogTag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setShowTagDialog(true);
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) return;

    try {
      if (editingTag) {
        await updateTag(editingTag.id, tagName);
      } else {
        await createTag(tagName);
      }
      setShowTagDialog(false);
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDeleteTag = (tag: BlogTag) => {
    setDeletingTag(tag);
    setShowDeleteTagDialog(true);
  };

  const confirmDeleteTag = async () => {
    if (!deletingTag) return;

    try {
      await deleteTag(deletingTag.id);
      setShowDeleteTagDialog(false);
      setDeletingTag(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
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
          <Button size="sm" onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-gold mx-auto"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No categories found
            </div>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">{category.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Slug: {category.slug}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-primary-gold" />
            Tags
          </CardTitle>
          <Button size="sm" onClick={handleAddTag}>
            <Plus className="w-4 h-4 mr-1" />
            Add Tag
          </Button>
        </CardHeader>
        <CardContent>
          {tagsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-gold mx-auto"></div>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No tags found
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="group relative">
                  <Badge className="py-1 px-2">
                    {tag.name}
                  </Badge>
                  <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 hidden group-hover:flex bg-white rounded-full shadow-sm border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => handleDeleteTag(tag)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!categoryName.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the category "{deletingCategory?.name}"?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Add Tag'}
            </DialogTitle>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name *
            </label>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
            />
            {tagName && (
              <p className="text-xs text-gray-500 mt-1">
                Slug: {generateSlug(tagName)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTagDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTag}
              disabled={!tagName.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <Dialog open={showDeleteTagDialog} onOpenChange={setShowDeleteTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the tag "{deletingTag?.name}"?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteTagDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTag}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryTagManager;