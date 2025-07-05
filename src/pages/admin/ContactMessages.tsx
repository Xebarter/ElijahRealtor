import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Eye, Reply, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useContactMessages } from '@/hooks/useDashboard';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { ContactMessage } from '@/types';

const ContactMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');

  const { messages, loading, error } = useContactMessages();

  const filteredMessages = messages.filter(message => {
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-blue-500 text-white',
      read: 'bg-yellow-500 text-white',
      replied: 'bg-green-500 text-white',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      toast.success(`Message marked as ${newStatus}`);
      
      // Refresh the data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update message status');
    }
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      // In a real app, this would send an email
      const subject = `Re: ${selectedMessage.subject}`;
      const body = `Dear ${selectedMessage.name},\n\n${replyText}\n\nBest regards,\nElijahRealtor Team`;
      
      const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      // Mark as replied
      updateMessageStatus(selectedMessage.id, 'replied');
      setReplyText('');
      setShowDetailsModal(false);
    }
  };

  const exportMessages = () => {
    const csvContent = [
      ['Date', 'Name', 'Email', 'Phone', 'Country', 'Subject', 'Status'],
      ...filteredMessages.map(msg => [
        new Date(msg.created_at).toLocaleDateString(),
        msg.name,
        msg.email,
        msg.phone,
        msg.country,
        msg.subject,
        msg.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-primary-navy">Contact Messages</h1>
          <p className="text-gray-600 mt-2">Manage customer inquiries and communications</p>
        </div>
        <Button onClick={exportMessages} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-primary-navy">{messages.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Messages</p>
                <p className="text-3xl font-bold text-blue-600">
                  {messages.filter(m => m.status === 'new').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {messages.filter(m => m.status === 'read').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-3xl font-bold text-green-600">
                  {messages.filter(m => m.status === 'replied').length}
                </p>
              </div>
              <Reply className="w-8 h-8 text-green-600" />
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
                placeholder="Search by name, email, subject, or country..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contact messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Contact</th>
                    <th className="text-left p-4 font-semibold">Subject</th>
                    <th className="text-left p-4 font-semibold">Country</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className={`border-b hover:bg-gray-50 ${message.status === 'new' ? 'bg-blue-50' : ''}`}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {message.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {message.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{message.subject}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {message.message}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-primary-gold" />
                          {message.country}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {message.status !== 'replied' && (
                            <Button
                              size="sm"
                              className="btn-primary"
                              onClick={() => {
                                const mailtoLink = `mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`;
                                window.open(mailtoLink);
                                updateMessageStatus(message.id, 'replied');
                              }}
                            >
                              <Reply className="w-4 h-4" />
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

      {/* Message Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">{selectedMessage.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedMessage.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium">{selectedMessage.phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <div className="font-medium">{selectedMessage.country}</div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Message Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Subject:</span>
                    <div className="font-medium">{selectedMessage.subject}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Message:</span>
                    <div className="bg-gray-50 p-4 rounded-lg mt-1">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Date */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <div className="text-sm text-gray-600">
                  Received: {new Date(selectedMessage.created_at).toLocaleString()}
                </div>
              </div>

              {/* Reply Section */}
              {selectedMessage.status !== 'replied' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Reply</h3>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 btn-primary"
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const mailtoLink = `mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`;
                        window.open(mailtoLink);
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Open in Email Client
                    </Button>
                  </div>
                </div>
              )}

              {selectedMessage.status === 'replied' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✓ This message has been replied to.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;