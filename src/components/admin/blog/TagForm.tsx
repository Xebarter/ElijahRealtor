import React, { useState } from 'react';
import { Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { generateSlug } from '@/lib/utils';
import type { BlogTag } from '@/types/blog';
import toast from 'react-hot-toast';

interface TagFormProps {
  tags: BlogTag[];
  onCreateTag: (data: { name: string; slug: string }) => Promise<void>;
  onUpdateTag: (id: string, data: { name: string; slug: string }) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}

export const TagForm: React.FC<TagFormProps> = ({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [deletingTag, setDeletingTag] = useState<BlogTag | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    setEditingTag(null);
    setTagName('');
    setShowDialog(true);
  };

  const handleEditTag = (tag: BlogTag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setShowDialog(true);
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingTag) {
        await onUpdateTag(editingTag.id, { name: tagName, slug: generateSlug(tagName) });
        toast.success('Tag updated successfully');
      } else {
        await onCreateTag({ name: tagName, slug: generateSlug(tagName) });
        toast.success('Tag created successfully');
      }
      setShowDialog(false);
      setTagName('');
      setEditingTag(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = (tag: BlogTag) => {
    setDeletingTag(tag);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTag = async () => {
    if (!deletingTag) return;

    setIsSubmitting(true);
    try {
      await onDeleteTag(deletingTag.id);
      toast.success('Tag deleted successfully');
      setShowDeleteDialog(false);
      setDeletingTag(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {tags.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No tags found
          </div>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-primary-gold" />
                  <Badge variant="secondary" className="font-medium">
                    {tag.name}
                  </Badge>
                  {tag.post_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      ({tag.post_count} posts)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTag(tag)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
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
          onClick={handleAddTag}
          className="w-full"
        >
          <Tag className="w-4 h-4 mr-2" />
          Add New Tag
        </Button>
      </div>

      {/* Tag Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Add Tag'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name *
              </label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name"
                disabled={isSubmitting}
              />
              {tagName && (
                <p className="text-xs text-gray-500 mt-1">
                  Slug: {generateSlug(tagName)}
                </p>
              )}
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
              onClick={handleSaveTag}
              disabled={!tagName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the tag "{deletingTag?.name}"?
            {deletingTag?.post_count && deletingTag.post_count > 0 && (
              <span className="block text-sm text-red-600 mt-1">
                This tag is used in {deletingTag.post_count} post(s).
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
              onClick={confirmDeleteTag}
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