import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AuroraText } from '@/components/ui/aurora-text';
import CreateContactModal from '@/components/admin/forms/CreateContactModal';
import AdminApiService from '@/services/adminApi';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [respondedFilter, setRespondedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [expandedContact, setExpandedContact] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getContacts(currentPage, 20, respondedFilter);
      setContacts(data.contacts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, respondedFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleUpdateContact = async (contactId, responded, notes = '') => {
    try {
      setUpdateLoading(contactId);
      await AdminApiService.updateContact(contactId, { 
        responded, 
        admin_notes: notes 
      });
      
      // Update the contact in the local state
      setContacts(contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, responded, admin_notes: notes }
          : contact
      ));
      
      setExpandedContact(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to update contact:', error);
      alert('Failed to update contact: ' + error.message);
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact submission? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(contactId);
      await AdminApiService.deleteContact(contactId);
      
      // Remove the contact from the local state
      setContacts(contacts.filter(contact => contact.id !== contactId));
      
      // Close expanded contact if it was the deleted one
      if (expandedContact === contactId) {
        setExpandedContact(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleContactCreated = (newContact) => {
    setContacts([newContact, ...contacts]);
  };

  const handleRespondedFilter = (value) => {
    setRespondedFilter(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTypeDisplay = (orderType) => {
    const types = {
      'general': 'General Inquiry',
      'custom-cake': 'Custom Cake Order',
      'catering': 'Catering Request',
      'corporate': 'Corporate Event',
      'wedding': 'Wedding Desserts',
      'complaint': 'Issue/Complaint'
    };
    return types[orderType] || orderType;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <AuroraText>Contact Submissions</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and support requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={respondedFilter}
            onChange={(e) => handleRespondedFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Contacts</option>
            <option value="false">Pending Response</option>
            <option value="true">Responded</option>
          </select>
          <Button onClick={() => setShowCreateModal(true)}>
            Add Contact
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchContacts} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{contact.subject}</h3>
                    <Badge variant={contact.responded ? 'default' : 'secondary'}>
                      {contact.responded ? '✅ Responded' : '⏳ Pending'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getOrderTypeDisplay(contact.order_type)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">From:</p>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted:</p>
                      <p className="text-sm text-foreground">{formatDate(contact.created_at)}</p>
                      <p className="text-sm text-muted-foreground">
                        Prefers: {contact.preferred_contact === 'email' ? 'Email' : 'Phone'}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Message:</p>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>
                  {contact.admin_notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Admin Notes:</p>
                      <div className="bg-primary/5 border-l-4 border-primary p-3 rounded">
                        <p className="text-foreground whitespace-pre-wrap">{contact.admin_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (expandedContact === contact.id) {
                      setExpandedContact(null);
                      setAdminNotes('');
                    } else {
                      setExpandedContact(contact.id);
                      setAdminNotes(contact.admin_notes || '');
                    }
                  }}
                >
                  {expandedContact === contact.id ? 'Cancel' : 'Respond'}
                </Button>
                {!contact.responded && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateContact(contact.id, true)}
                    disabled={updateLoading === contact.id}
                  >
                    {updateLoading === contact.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      'Mark Responded'
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteContact(contact.id)}
                  disabled={deleteLoading === contact.id}
                >
                  {deleteLoading === contact.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>

            {/* Response Form */}
            {expandedContact === contact.id && (
              <div className="border-t border-border pt-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Admin Notes (Internal Use)
                    </label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this contact submission..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExpandedContact(null);
                        setAdminNotes('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleUpdateContact(contact.id, true, adminNotes)}
                      disabled={updateLoading === contact.id}
                    >
                      {updateLoading === contact.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                      ) : null}
                      Save & Mark Responded
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {contacts.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-2">No contact submissions found</h3>
          <p className="text-muted-foreground">
            {respondedFilter ? 'Try adjusting your filter.' : 'No customers have submitted any inquiries yet.'}
          </p>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} contacts
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.has_previous || loading}
            >
              Previous
            </Button>
            
            <span className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.has_next || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onContactCreated={handleContactCreated}
      />
    </div>
  );
};

export default AdminContacts;