import { useState } from 'react';
import { DollarSign, User, Building, FileText, CheckCircle, XCircle, Clock, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useFinancingApplications } from '@/hooks/useDashboard';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/countries';
import toast from 'react-hot-toast';
import type { FinancingApplication } from '@/types';

const FinancingManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState<FinancingApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { applications, loading, error } = useFinancingApplications();

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.property?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      received: 'bg-blue-500 text-white',
      forwarded: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    setUpdatingStatus(applicationId);
    try {
      const { error } = await supabase
        .from('financing_applications')
        .update({ 
          status: newStatus,
          notes: notes || null
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Application ${newStatus} successfully`);
      setShowDetailsModal(false);
      setSelectedApplication(null);
      setNotes('');
      
      // Refresh the data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (application: FinancingApplication) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowDetailsModal(true);
  };

  const exportApplications = () => {
    const csvContent = [
      ['Date', 'Applicant Name', 'Email', 'Phone', 'Property', 'Monthly Income', 'Currency', 'Employment', 'Status'],
      ...filteredApplications.map(app => [
        new Date(app.created_at).toLocaleDateString(),
        app.applicant_name,
        app.applicant_email,
        app.applicant_phone,
        app.property?.title || '',
        app.monthly_income || '',
        app.currency || '',
        app.employment_status || '',
        app.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financing-applications-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-primary-navy">Financing Applications</h1>
          <p className="text-gray-600 mt-2">Manage property financing applications and approvals</p>
        </div>
        <Button onClick={exportApplications} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-primary-navy">{applications.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-blue-600">
                  {applications.filter(a => a.status === 'received').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'approved').length}
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
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
                placeholder="Search by applicant name, email, or property..."
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
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="forwarded">Forwarded</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financing Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No financing applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Applicant</th>
                    <th className="text-left p-4 font-semibold">Property</th>
                    <th className="text-left p-4 font-semibold">Income</th>
                    <th className="text-left p-4 font-semibold">Employment</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{application.applicant_name}</div>
                          <div className="text-sm text-gray-500">{application.applicant_email}</div>
                          <div className="text-sm text-gray-500">{application.applicant_phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{application.property?.title}</div>
                          <div className="text-sm text-gray-500">
                            {application.property?.location}, {application.property?.city}
                          </div>
                          <div className="text-sm text-primary-gold">
                            {application.property && formatPrice(application.property.price, application.property.currency)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          {application.monthly_income && application.currency && (
                            <div className="font-medium">
                              {formatPrice(application.monthly_income, application.currency)}/month
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {application.employment_status || 'Not specified'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {application.status === 'received' && (
                            <>
                              <Button
                                size="sm"
                                className="btn-primary"
                                onClick={() => updateApplicationStatus(application.id, 'forwarded')}
                                disabled={!!updatingStatus}
                              >
                                Forward
                              </Button>
                            </>
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

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Financing Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">{selectedApplication.applicant_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedApplication.applicant_email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium">{selectedApplication.applicant_phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Employment:</span>
                    <div className="font-medium capitalize">{selectedApplication.employment_status || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monthly Income:</span>
                    <div className="font-medium">
                      {selectedApplication.monthly_income && selectedApplication.currency 
                        ? formatPrice(selectedApplication.monthly_income, selectedApplication.currency)
                        : 'Not specified'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Currency:</span>
                    <div className="font-medium">{selectedApplication.currency || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Property:</span>
                    <div className="font-medium">{selectedApplication.property?.title}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium">
                      {selectedApplication.property?.location}, {selectedApplication.property?.city}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <div className="font-medium text-primary-gold">
                      {selectedApplication.property && formatPrice(selectedApplication.property.price, selectedApplication.property.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-primary-gold" />
                      <span className="font-medium">ID Document</span>
                    </div>
                    {selectedApplication.id_document_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.id_document_url} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">Not uploaded</span>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-primary-gold" />
                      <span className="font-medium">Income Proof</span>
                    </div>
                    {selectedApplication.income_proof_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.income_proof_url} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Application Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-2">{getStatusBadge(selectedApplication.status)}</div>
                    <div className="text-sm text-gray-600">
                      Submitted: {new Date(selectedApplication.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                <Textarea
                  placeholder="Add notes about this application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedApplication.status === 'received' && (
                  <>
                    <Button
                      className="flex-1 btn-primary"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'forwarded', notes)}
                      disabled={!!updatingStatus}
                    >
                      Forward to Bank
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved', notes)}
                      disabled={!!updatingStatus}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected', notes)}
                      disabled={!!updatingStatus}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'forwarded' && (
                  <>
                    <Button
                      className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved', notes)}
                      disabled={!!updatingStatus}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected', notes)}
                      disabled={!!updatingStatus}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {(selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateApplicationStatus(selectedApplication.id, selectedApplication.status, notes)}
                    disabled={!!updatingStatus}
                  >
                    Update Notes
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

export default FinancingManagement;