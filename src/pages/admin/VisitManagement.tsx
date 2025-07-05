import { useState } from 'react';
import { Calendar, Clock, Phone, Mail, MapPin, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useVisits } from '@/hooks/useVisits';
import { formatPrice } from '@/lib/countries';
import type { Visit } from '@/types';

const VisitManagement = () => {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { visits, loading, error, updateVisitStatus } = useVisits();

  const filteredVisits = visits.filter(visit => {
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || visit.payment_status === paymentFilter;
    const matchesSearch = searchTerm === '' || 
      visit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.property?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-green-500 text-white',
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

  const handleStatusUpdate = async (visitId: string, newStatus: string, notes?: string) => {
    try {
      await updateVisitStatus(visitId, newStatus, notes);
      setShowDetailsModal(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const handleViewDetails = (visit: Visit) => {
    setSelectedVisit(visit);
    setShowDetailsModal(true);
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
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Visit Management</h1>
        <p className="text-gray-600 mt-2">Manage property visit bookings and schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-3xl font-bold text-primary-navy">{visits.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">
                  {visits.filter(v => v.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {visits.filter(v => v.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Visits</p>
                <p className="text-3xl font-bold text-primary-gold">
                  {visits.filter(v => v.payment_status === 'paid').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary-gold" />
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
                placeholder="Search by visitor name, email, or property..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Bookings ({filteredVisits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVisits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No visits found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Visitor</th>
                    <th className="text-left p-4 font-semibold">Property</th>
                    <th className="text-left p-4 font-semibold">Date & Time</th>
                    <th className="text-left p-4 font-semibold">Payment</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((visit) => (
                    <tr key={visit.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{visit.name}</div>
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
                          <div className="font-medium">{visit.property?.title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {visit.property?.location}, {visit.property?.city}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-primary-gold" />
                            {new Date(visit.preferred_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1 text-primary-gold" />
                            {new Date(visit.preferred_time).toLocaleTimeString()}
                          </div>
                        </div>
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
                        {getStatusBadge(visit.status)}
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
                          {visit.status === 'pending' && visit.payment_status === 'paid' && (
                            <Button
                              size="sm"
                              className="btn-primary"
                              onClick={() => handleStatusUpdate(visit.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="space-y-6">
              {/* Visitor Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Visitor Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{selectedVisit.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{selectedVisit.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{selectedVisit.phone}</span>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">{selectedVisit.property?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">
                      {selectedVisit.property?.location}, {selectedVisit.property?.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">
                      {selectedVisit.property && formatPrice(selectedVisit.property.price, selectedVisit.property.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Visit Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {new Date(selectedVisit.preferred_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>{getPaymentBadge(selectedVisit.payment_status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visit Status:</span>
                    <span>{getStatusBadge(selectedVisit.status)}</span>
                  </div>
                  {selectedVisit.transaction_id && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-medium">{selectedVisit.transaction_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedVisit.message && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedVisit.message}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <Textarea
                  placeholder="Add internal notes about this visit..."
                  defaultValue={selectedVisit.admin_notes || ''}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedVisit.status === 'pending' && selectedVisit.payment_status === 'paid' && (
                  <Button
                    className="flex-1 btn-primary"
                    onClick={() => handleStatusUpdate(selectedVisit.id, 'confirmed')}
                  >
                    Confirm Visit
                  </Button>
                )}
                {selectedVisit.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(selectedVisit.id, 'cancelled')}
                  >
                    Cancel Visit
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitManagement;