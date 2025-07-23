import { useState } from 'react';
import { Plus, Star, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTestimonials } from '@/hooks/useTestimonials';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Testimonial } from '@/types';
import TestimonialForm from '@/components/admin/TestimonialForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TestimonialsManagement = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { testimonials, loading, error, addTestimonial, updateTestimonial, deleteTestimonial, refetch } = useTestimonials();

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      testimonial.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.country && testimonial.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
    };

    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-primary-gold fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddTestimonial = () => {
    setSelectedTestimonial(null);
    setShowFormModal(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowFormModal(true);
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await deleteTestimonial(id);
      toast.success('Testimonial deleted successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete testimonial';
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = async (data: Omit<Testimonial, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (selectedTestimonial) {
        await updateTestimonial(selectedTestimonial.id, data);
        toast.success('Testimonial updated successfully');
      } else {
        await addTestimonial(data);
        toast.success('Testimonial added successfully');
      }
      setShowFormModal(false);
      setSelectedTestimonial(null);
      refetch(); // Refresh the list
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save testimonial';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTestimonialStatus = async (testimonialId: string, newStatus: string) => {
    setUpdatingStatus(testimonialId);
    try {
      await supabase
        .from('testimonials')
        .update({ status: newStatus })
        .eq('id', testimonialId);

      toast.success(`Testimonial ${newStatus} successfully`);
      setShowDetailsModal(false);
      setSelectedTestimonial(null);
      refetch(); // Refresh the data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update testimonial status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDetailsModal(true);
  };

  const renderTestimonialMedia = (testimonial: Testimonial) => {
    if (testimonial.type === 'video' && testimonial.media_urls && testimonial.media_urls.length > 0) {
      const videoUrl = testimonial.media_urls[0];
      
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        );
      } else if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        );
      } else {
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }

    if (testimonial.type === 'image' && testimonial.media_urls && testimonial.media_urls.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {testimonial.media_urls.slice(0, 4).map((imageUrl: string, index: number) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={`${testimonial.client_name} testimonial image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Testimonials Management</h1>
          <p className="text-gray-600 mt-2">Manage client testimonials and reviews</p>
        </div>
        <Button className="btn-primary" onClick={handleAddTestimonial}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                <p className="text-3xl font-bold text-primary-navy">{testimonials.length}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {testimonials.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <ImageIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {testimonials.filter(t => t.status === 'approved').length}
                </p>
              </div>
              <ImageIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-primary-gold">
                  {testimonials.length > 0 
                    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by client name, content, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No testimonials found</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {testimonial.client_image_url ? (
                      <img
                        src={testimonial.client_image_url}
                        alt={testimonial.client_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-gold/10 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-primary-gold" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.client_name}</h3>
                      {testimonial.client_title && (
                        <p className="text-sm text-gray-500">{testimonial.client_title}</p>
                      )}
                      {testimonial.country && (
                        <p className="text-sm text-gray-500">{testimonial.country}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(testimonial.status)}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                </div>

                {/* Content */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  "{testimonial.content}"
                </p>

                {/* Media indicator */}
                {testimonial.media_urls && testimonial.media_urls.length > 0 && (
                  <div className="flex items-center text-sm text-primary-gold mb-4">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    {testimonial.type} testimonial with {testimonial.media_urls.length} media files
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-gray-500 mb-4">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(testimonial)}
                    className="flex-grow"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTestimonial(testimonial)}
                    className="flex-grow"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-grow text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          testimonial and remove its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTestimonial(testimonial.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {testimonial.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="btn-primary"
                        onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                        disabled={!!updatingStatus}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                        disabled={!!updatingStatus}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Testimonial Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
          </DialogHeader>
          
          {selectedTestimonial && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="flex items-center space-x-4">
                {selectedTestimonial.client_image_url ? (
                  <img
                    src={selectedTestimonial.client_image_url}
                    alt={selectedTestimonial.client_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary-gold" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTestimonial.client_name}</h3>
                  {selectedTestimonial.client_title && (
                    <p className="text-gray-600">{selectedTestimonial.client_title}</p>
                  )}
                  {selectedTestimonial.country && (
                    <p className="text-gray-600">{selectedTestimonial.country}</p>
                  )}
                  <div className="flex items-center mt-1">
                    {renderStars(selectedTestimonial.rating)}
                    <span className="ml-2 text-sm text-gray-600">({selectedTestimonial.rating}/5)</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Testimonial Content</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 italic">"{selectedTestimonial.content}"</p>
                </div>
              </div>

              {/* Media */}
              {selectedTestimonial.media_urls && selectedTestimonial.media_urls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedTestimonial.type === 'video' ? 'Video' : 'Images'}
                  </h4>
                  {renderTestimonialMedia(selectedTestimonial)}
                </div>
              )}

              {/* Status and Date */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  {getStatusBadge(selectedTestimonial.status)}
                </div>
                <div className="text-sm text-gray-600">
                  Submitted: {new Date(selectedTestimonial.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              {selectedTestimonial.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 btn-primary"
                    onClick={() => updateTestimonialStatus(selectedTestimonial.id, 'approved')}
                    disabled={!!updatingStatus}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => updateTestimonialStatus(selectedTestimonial.id, 'rejected')}
                    disabled={!!updatingStatus}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
              
              {selectedTestimonial.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✓ This testimonial is approved and visible on the public website.
                  </p>
                </div>
              )}
              
              {selectedTestimonial.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm">
                    ✗ This testimonial has been rejected and is not visible on the website.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Testimonial Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
          </DialogHeader>
          <TestimonialForm
            testimonial={selectedTestimonial}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowFormModal(false)}
            loading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManagement;
