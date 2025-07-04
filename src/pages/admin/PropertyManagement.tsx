import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/countries';
import toast from 'react-hot-toast';
import type { Property, PropertyFilters } from '@/types';

const PropertyManagement = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null);

  const { properties, loading, error, meta, refetch } = useProperties(filters, currentPage, 10);

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    setDeletingProperty(propertyId);
    try {
      // Delete property images first
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);

      if (imagesError) throw imagesError;

      // Delete the property
      const { error: propertyError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (propertyError) throw propertyError;

      toast.success('Property deleted successfully');
      setShowDeleteDialog(false);
      setSelectedProperty(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete property');
    } finally {
      setDeletingProperty(null);
    }
  };

  const toggleFeatured = async (propertyId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ featured: !currentFeatured })
        .eq('id', propertyId);

      if (error) throw error;

      toast.success(`Property ${!currentFeatured ? 'marked as featured' : 'removed from featured'}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update property');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      available: 'bg-accent-positive text-white',
      pending: 'bg-yellow-500 text-white',
      sold: 'bg-red-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMainImage = (property: Property) => {
    if (property.property_images && property.property_images.length > 0) {
      // Sort by display_order and get the first one
      const sortedImages = property.property_images.sort((a, b) => a.display_order - b.display_order);
      return sortedImages[0].image_url;
    }
    
    // Fallback to legacy images array
    if (property.images && property.images.length > 0) {
      return property.images[0];
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
          <h1 className="text-3xl font-bold text-primary-navy">Property Management</h1>
          <p className="text-gray-600 mt-2">Manage your property listings and details</p>
        </div>
        <Link to="/admin/properties/create">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-primary-navy">{meta.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'available').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {properties.filter(p => p.featured).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-3xl font-bold text-red-600">
                  {properties.filter(p => p.status === 'sold').length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search properties..."
                value={filters.search || ''}
                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFiltersChange({ 
                ...filters, 
                status: value === 'all' ? undefined : value as any 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.property_type || 'all'}
              onValueChange={(value) => handleFiltersChange({ 
                ...filters, 
                property_type: value === 'all' ? undefined : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.featured ? 'featured' : 'all'}
              onValueChange={(value) => handleFiltersChange({ 
                ...filters, 
                featured: value === 'featured' ? true : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Property</th>
                    <th className="text-left p-4 font-semibold">Location</th>
                    <th className="text-left p-4 font-semibold">Price</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Featured</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => {
                    const mainImage = getMainImage(property);
                    const imageCount = property.property_images?.length || 0;
                    
                    return (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                              {mainImage ? (
                                <img
                                  src={mainImage}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-gray-500">
                                {property.bedrooms && `${property.bedrooms} bed`}
                                {property.bathrooms && ` • ${property.bathrooms} bath`}
                                {property.size_sqft && ` • ${property.size_sqft} sqft`}
                              </div>
                              {imageCount > 0 && (
                                <div className="text-xs text-primary-gold">
                                  {imageCount} images
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{property.city}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                            <div className="text-sm text-gray-500">{property.country}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {formatPrice(property.price, property.currency)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {property.property_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(property.status)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(property.id, property.featured)}
                            className={property.featured ? 'text-yellow-600' : 'text-gray-400'}
                          >
                            <Star className={`w-4 h-4 ${property.featured ? 'fill-current' : ''}`} />
                          </Button>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link to={`/properties/${property.id}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/properties/${property.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "btn-primary" : ""}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this property? This action cannot be undone.</p>
            {selectedProperty && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedProperty.title}</h4>
                <p className="text-sm text-gray-600">
                  {selectedProperty.location}, {selectedProperty.city}
                </p>
                {selectedProperty.property_images && selectedProperty.property_images.length > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    This will also delete {selectedProperty.property_images.length} associated images.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedProperty && handleDeleteProperty(selectedProperty.id)}
                disabled={!!deletingProperty}
                className="flex-1"
              >
                {deletingProperty ? 'Deleting...' : 'Delete Property'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;