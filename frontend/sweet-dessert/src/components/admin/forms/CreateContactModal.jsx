import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminApiService from '@/services/adminApi';

const CreateContactModal = ({ isOpen, onClose, onContactCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    order_type: 'general',
    preferred_contact: 'email',
    responded: false,
    admin_notes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await AdminApiService.createContact(formData);
      onContactCreated(result.contact);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        order_type: 'general',
        preferred_contact: 'email',
        responded: false,
        admin_notes: ''
      });
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Failed to create contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const orderTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'custom-cake', label: 'Custom Cake Order' },
    { value: 'catering', label: 'Catering Request' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'wedding', label: 'Wedding Desserts' },
    { value: 'complaint', label: 'Issue/Complaint' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Contact Submission">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Customer name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="customer@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Phone
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Order Type
            </label>
            <select
              name="order_type"
              value={formData.order_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {orderTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Contact subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Contact message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Preferred Contact Method
          </label>
          <select
            name="preferred_contact"
            value={formData.preferred_contact}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Admin Notes
          </label>
          <Textarea
            name="admin_notes"
            value={formData.admin_notes}
            onChange={handleChange}
            rows={3}
            placeholder="Internal admin notes..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="responded"
            checked={formData.responded}
            onChange={handleChange}
            className="rounded border-border"
          />
          <label className="text-sm text-foreground">
            Mark as already responded
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            ) : null}
            Create Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateContactModal;