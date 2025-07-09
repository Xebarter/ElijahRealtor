import { useState } from 'react';
import { Calendar, Clock, Download, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/lib/utils';
import type { Visit } from '@/types';

const VisitBookings = () => {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Mock data - replace with actual hook when available
  const [visits] = useState<Visit[]>([]);
  const [loading] = useState(false);

  const handleStatusChange = (visit: Visit, newStatus: string) => {
    // Mock implementation
    console.log('Status change:', visit.id, newStatus);
  };

  const handleViewDetails = (visit: Visit) => {
    setSelectedVisit(visit);
    setAdminNotes(visit.admin_notes || '');
    setShowDetailsModal(true);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Visitor Name', 'Email', 'Phone', 'Property', 'Visit Time', 'Payment Status', 'Status'],
      ...visits.map((visit: Visit) => [
        new Date(visit.created_at).toLocaleDateString(),
        visit.name,
        visit.email,
        visit.phone,
        visit.property?.title || 'N/A',
        visit.preferred_time,
        visit.payment_status,
        visit.status,
      ]),
    ];

    const blob = new Blob([csvContent.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Visit Bookings</h1>
          <p className="text-gray-600 mt-2">Manage property visit appointments and schedules</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
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
          <CardTitle>Visit Bookings ({visits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No visit bookings found</p>
            </div>
          ) : (
              <div className="overflow-x-auto rounded-lg shadow bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Visitor</th>
                    <th className="text-left p-4 font-semibold">Property</th>
                    <th className="text-left p-4 font-semibold">Visit Time</th>
                    <th className="text-left p-4 font-semibold">Payment</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit: Visit) => (
                    <tr key={visit.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(visit.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(visit.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">{visit.name}</div>
                        <div className="text-sm text-gray-500">{visit.email}</div>
                        <div className="text-sm text-gray-500">{visit.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {visit.property?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.property?.location || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{visit.preferred_time}</div>
                      </td>
                      <td className="p-4">
                        {visit.payment_status === 'paid' ? (
                          <Badge className="bg-green-500 text-white">Paid</Badge>
                        ) : (
                          <Badge className="bg-orange-500 text-white">Pending</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {visit.status === 'confirmed' ? (
                          <Badge className="bg-green-500 text-white">Confirmed</Badge>
                        ) : visit.status === 'pending' ? (
                          <Badge className="bg-yellow-500 text-white">Pending</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">Cancelled</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
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
                            className="btn-primary"
                            onClick={() => handleStatusChange(visit, 'confirmed')}
                          >
                            Confirm
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="space-y-6">
              {/* Visitor Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Visitor Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Visitor Name:</span>
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
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">{selectedVisit.property?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visit Time:</span>
                    <span className="font-medium">{selectedVisit.preferred_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>{selectedVisit.payment_status === 'paid' ? (
                      <Badge className="bg-green-500 text-white">Paid</Badge>
                    ) : (
                      <Badge className="bg-orange-500 text-white">Pending</Badge>
                    )}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visit Status:</span>
                    <span>{selectedVisit.status === 'confirmed' ? (
                      <Badge className="bg-green-500 text-white">Confirmed</Badge>
                    ) : selectedVisit.status === 'pending' ? (
                      <Badge className="bg-yellow-500 text-white">Pending</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">Cancelled</Badge>
                    )}</span>
                  </div>
                  {selectedVisit.transaction_id && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-sm">{selectedVisit.transaction_id}</span>
                    </div>
                  )}
                  {selectedVisit.message && (
                    <div className="mt-4">
                      <span className="block text-sm font-medium text-gray-700 mb-2">Message:</span>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedVisit.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                <div className="space-y-2 text-sm">
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
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 btn-primary"
                  onClick={() => handleStatusChange(selectedVisit, 'confirmed')}
                >
                  Confirm Visit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleStatusChange(selectedVisit, 'cancelled')}
                >
                  Cancel Visit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange(selectedVisit, 'confirmed')}
                >
                  Update Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default VisitBookings;