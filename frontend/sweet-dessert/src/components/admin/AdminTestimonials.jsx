import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [approvedFilter, setApprovedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    rating: 5,
    text: '',
    dessert_item: '',
    approved: false
  });

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getTestimonials(currentPage, 20, approvedFilter);
      setTestimonials(data.testimonials);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [currentPage, approvedFilter]);

  const fetchDesserts = useCallback(async () => {
    try {
      const data = await AdminApiService.getAllDesserts();
      setDesserts(data.results || data);
    } catch (error) {
      console.error('Failed to fetch desserts:', error);
    }
  }, []);

  useEffect(() => {
    fetchDesserts();
  }, [fetchDesserts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTestimonials();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchTestimonials]);

  const handleDeleteTestimonial = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(testimonialId);
      await AdminApiService.deleteTestimonial(testimonialId);
      await fetchTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleApprovedFilter = (value) => {
    setApprovedFilter(value);
    setCurrentPage(1);
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        avatar: testimonial.avatar || '',
        rating: testimonial.rating,
        text: testimonial.text,
        dessert_item: testimonial.dessert_item || '',
        approved: testimonial.approved
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '',
        avatar: '',
        rating: 5,
        text: '',
        dessert_item: '',
        approved: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({
      name: '',
      avatar: '',
      rating: 5,
      text: '',
      dessert_item: '',
      approved: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        dessert_item: formData.dessert_item || null
      };
      
      if (editingTestimonial) {
        await AdminApiService.updateTestimonial(editingTestimonial.id, submitData);
      } else {
        await AdminApiService.createTestimonial(submitData);
      }
      await fetchTestimonials();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      alert('Failed to save testimonial: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'rating' ? parseInt(value) || 1 : 
               value
    }));
  };

  const toggleApproval = async (testimonialId, currentApproval) => {
    try {
      await AdminApiService.updateTestimonial(testimonialId, { approved: !currentApproval });
      setTestimonials(testimonials.map(t => 
        t.id === testimonialId ? { ...t, approved: !currentApproval } : t
      ));
    } catch (error) {
      console.error('Failed to update approval:', error);
      alert('Failed to update approval: ' + error.message);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ));
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
            <AuroraText>Testimonials Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage customer testimonials and reviews
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={approvedFilter}
            onChange={(e) => handleApprovedFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Testimonials</option>
            <option value="true">Approved Only</option>
            <option value="false">Pending Approval</option>
          </select>
          <Button onClick={() => handleOpenModal()}>
            Add Testimonial
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchTestimonials} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {testimonial.avatar ? (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <div className="flex items-center space-x-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <Badge variant={testimonial.approved ? 'default' : 'secondary'}>
                {testimonial.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              "{testimonial.text}"
            </p>

            {testimonial.dessert_item_name && (
              <p className="text-xs text-muted-foreground mb-4">
                About: {testimonial.dessert_item_name}
              </p>
            )}

            <p className="text-xs text-muted-foreground mb-4">
              {new Date(testimonial.created_at).toLocaleDateString()}
            </p>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(testimonial)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant={testimonial.approved ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => toggleApproval(testimonial.id, testimonial.approved)}
                  className="text-xs"
                >
                  {testimonial.approved ? 'Unapprove' : 'Approve'}
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTestimonial(testimonial.id)}
                disabled={deleteLoading === testimonial.id}
                className="text-xs"
              >
                {deleteLoading === testimonial.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-2">No testimonials found</h3>
          <p className="text-muted-foreground mb-6">
            {approvedFilter ? 'Try adjusting your filters.' : 'Add your first testimonial to get started.'}
          </p>
          <Button onClick={() => handleOpenModal()}>
            Add Testimonial
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} testimonials
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Customer Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Avatar URL
              </label>
              <Input
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rating *
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Testimonial Text *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter testimonial text"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Related Dessert (Optional)
              </label>
              <select
                name="dessert_item"
                value={formData.dessert_item}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">Select a dessert (optional)</option>
                {desserts.map(dessert => (
                  <option key={dessert.id} value={dessert.id}>
                    {dessert.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="approved"
                id="approved"
                checked={formData.approved}
                onChange={handleInputChange}
                className="rounded border-border"
              />
              <label htmlFor="approved" className="text-sm font-medium text-foreground">
                Approve this testimonial
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTestimonials;