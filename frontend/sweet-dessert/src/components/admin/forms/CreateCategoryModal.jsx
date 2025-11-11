import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import adminApi from '@/services/adminApi';

const CreateCategoryModal = ({ isOpen, onClose, onCategoryCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    product_count: 0,
    order: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminApi.createCategory(formData);
      onCategoryCreated(result.category);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        product_count: 0,
        order: 0
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Category</h2>
      </ModalHeader>
      <ModalBody>
        <form id="create-category-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Cakes, Cookies, Pastries"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="auto-generated from name"
            />
            <p className="text-sm text-muted-foreground">
              Used in URLs. Will be auto-generated if left empty.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of this category..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/category-image.jpg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_count">Product Count</Label>
              <Input
                id="product_count"
                name="product_count"
                type="number"
                min="0"
                value={formData.product_count}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Number of products in this category
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Sort order (0 = first)
              </p>
            </div>
          </div>
          
        </form>
      </ModalBody>
      <ModalFooter>
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
          disabled={loading || !formData.name}
          onClick={() => document.getElementById('create-category-form').requestSubmit()}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateCategoryModal;