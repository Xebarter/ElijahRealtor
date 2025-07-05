import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Building,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { usePropertyVisits, type PropertyVisit, type PropertyVisitFilters } from '@/hooks/usePropertyVisits';
import { useProperties } from '@/hooks/useProperties';
import { formatPrice } from '@/lib/countries';

const PropertyVisits = () => {
  const [filters, setFilters] = useState<PropertyVisitFilters>({});
  const [selectedVisit, setSelectedVisit] = useState<PropertyVisit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PropertyVisit>>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { 
    visits, 
    loading, 
    error, 
    updateVisitStatus, 
    updateVisitDetails, 
    deleteVisit, 
    getVisitStats 
  } = usePropertyVisits(filters);

  const { properties } = useProperties({}, 1, 100); // Get all properties for filter dropdown

  const stats = getVisitStats();

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-500 text-white',
      completed: 'bg-green-500 text-white',
      cancelled: 'bg-red-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-orange-500 text-white',
      paid: 'bg-green-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = async (visitId: string, newStatus: PropertyVisit['status'], notes?: string) => {
    setUpdatingStatus(visitId);
    try {
      await updateVisitStatus(visitId, newStatus, notes);
      setShowDetailsModal(false);
      setSelectedVisit(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating visit status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (visit: PropertyVisit) => {
    setSelectedVisit(visit);
    setAdminNotes(visit.admin_notes || '');
    setShowDetailsModal(true);
  };

  const handleEditVisit = (visit: PropertyVisit) => {
    setSelectedVisit(visit);
    setEditFormData({
      visitor_name: visit.visitor_name,
      email: visit.email,
      phone: visit.phone,
      preferred_date: visit.preferred_date,
      preferred_time: visit.preferred_time,
      notes: visit.notes,
      admin_notes: visit.admin_notes,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedVisit) return;

    try {
      await updateVisitDetails(selectedVisit.id, editFormData);
      setShowEditModal(false);
      setSelectedVisit(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating visit details:', error);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit? This action cannot be undone.')) {
      try {
        await deleteVisit(visitId);
      } catch (error) {
        console.error('Error deleting visit:', error);
      }
    }
  };

  const exportVisits = () => {
    const csvContent = [
      ['Date Created', 'Visitor Name', 'Email', 'Phone', 'Property', 'Visit Date', 'Visit Time', 'Status', 'Payment Status'],
      ...visits.map(visit => [
        new Date(visit.created_at).toLocaleDateString(),
        visit.visitor_name,
        visit.email,
        visit.phone,
        visit.property?.title || '',
        visit.preferred_date,
        visit.preferred_time,
        visit.status,
        visit.payment_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-visits-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({});
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Property Visits</h1>
          <p className="text-gray-600 mt-2">Manage property visit requests and appointments</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportVisits} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-primary-navy">{stats.total}</p>
              </div>
              <Calendar className="w-6 h-6 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-primary-gold">{stats.paid}</p>
              </div>
              <Calendar className="w-6 h-6 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search by name, email, or phone..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={filters.property_id || 'all'}
                onValueChange={(value) => setFilters({ ...filters, property_id: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                type="date"
                placeholder="From date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="To date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
              {(filters.search || filters.status || filters.property_id || filters.date_from || filters.date_to) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Visits ({visits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No property visits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Visitor</th>
                    <th className="text-left p-4 font-semibold">Property</th>
                    <th className="text-left p-4 font-semibold">Visit Schedule</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Payment</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="w-4 h-4 mr-2 text-primary-gold" />
                            {visit.visitor_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {visit.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {visit.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium flex items-center">
                            <Building className="w-4 h-4 mr-2 text-primary-gold" />
                            {visit.property?.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {visit.property?.location}, {visit.property?.city}
                          </div>
                          {visit.property && (
                            <div className="text-sm text-primary-gold">
                              {formatPrice(visit.property.price, visit.property.currency)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="flex items-center font-medium">
                            <Calendar className="w-3 h-3 mr-1 text-primary-gold" />
                            {new Date(visit.preferred_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1 text-primary-gold" />
                            {visit.preferred_time}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(visit.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(visit.status)}
                      </td>
                      <td className="p-4">
                        {getPaymentBadge(visit.payment_status)}
                        {visit.transaction_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {visit.transaction_id.slice(-8)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(visit)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVisit(visit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {visit.status === 'pending' && (
                            <Button
                              size="sm"
                              className="btn-primary"
                              onClick={() => handleStatusUpdate(visit.id, 'confirmed')}
                              disabled={!!updatingStatus}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="space-y-6">
              {/* Visitor Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Visitor Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">{selectedVisit.visitor_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedVisit.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium">{selectedVisit.phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div>{getStatusBadge(selectedVisit.status)}</div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Property:</span>
                    <div className="font-medium">{selectedVisit.property?.title}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium">
                      {selectedVisit.property?.location}, {selectedVisit.property?.city}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <div className="font-medium">
                      {selectedVisit.property && formatPrice(selectedVisit.property.price, selectedVisit.property.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Visit Schedule</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">
                      {new Date(selectedVisit.preferred_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <div className="font-medium">{selectedVisit.preferred_time}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <div>{getPaymentBadge(selectedVisit.payment_status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Requested:</span>
                    <div className="font-medium">
                      {new Date(selectedVisit.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVisit.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Visitor Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <Textarea
                  placeholder="Add internal notes about this visit..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedVisit.status === 'pending' && (
                  <Button
                    className="flex-1 btn-primary"
                    onClick={() => handleStatusUpdate(selectedVisit.id, 'confirmed', adminNotes)}
                    disabled={!!updatingStatus}
                  >
                    Confirm Visit
                  </Button>
                )}
                {selectedVisit.status === 'confirmed' && (
                  <Button
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleStatusUpdate(selectedVisit.id, 'completed', adminNotes)}
                    disabled={!!updatingStatus}
                  >
                    Mark Completed
                  </Button>
                )}
                {selectedVisit.status !== 'cancelled' && selectedVisit.status !== 'completed' && (
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(selectedVisit.id, 'cancelled', adminNotes)}
                    disabled={!!updatingStatus}
                  >
                    Cancel Visit
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusUpdate(selectedVisit.id, selectedVisit.status, adminNotes)}
                  disabled={!!updatingStatus}
                >
                  Update Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Visit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Visit Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visitor Name
                </label>
                <Input
                  value={editFormData.visitor_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, visitor_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={editFormData.preferred_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, preferred_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <Input
                  type="time"
                  value={editFormData.preferred_time || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, preferred_time: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visitor Notes
              </label>
              <Textarea
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <Textarea
                value={editFormData.admin_notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 btn-primary"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyVisits;