import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Using regular HTML select elements instead of complex Select component
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import adminApi from '@/services/adminApi';

const CreateProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image: '',
    preparation_time: 30,
    featured: false,
    seasonal: false,
    best_seller: false,
    available: true,
    dietary_info: [],
    ingredients: [],
    allergens: []
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const result = await adminApi.getAllCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
      const result = await adminApi.createProduct(formData);
      onProductCreated(result.product);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        image: '',
        preparation_time: 30,
        featured: false,
        seasonal: false,
        best_seller: false,
        available: true,
        dietary_info: [],
        ingredients: [],
        allergens: []
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleArrayChange = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: array
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Product</h2>
      </ModalHeader>
      <ModalBody>
        <form id="create-product-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preparation_time">Preparation Time (minutes)</Label>
                <Input
                  id="preparation_time"
                  name="preparation_time"
                  type="number"
                  min="1"
                  value={formData.preparation_time}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Product Attributes */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <h4 className="font-medium">Product Attributes</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Product</Label>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="seasonal">Seasonal</Label>
                  <Switch
                    id="seasonal"
                    checked={formData.seasonal}
                    onCheckedChange={(checked) => handleSwitchChange('seasonal', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="best_seller">Best Seller</Label>
                  <Switch
                    id="best_seller"
                    checked={formData.best_seller}
                    onCheckedChange={(checked) => handleSwitchChange('best_seller', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available</Label>
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => handleSwitchChange('available', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients.join(', ')}
                onChange={(e) => handleArrayChange('ingredients', e.target.value)}
                placeholder="Flour, Sugar, Eggs, Butter..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens (comma separated)</Label>
              <Textarea
                id="allergens"
                value={formData.allergens.join(', ')}
                onChange={(e) => handleArrayChange('allergens', e.target.value)}
                placeholder="Gluten, Dairy, Nuts..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dietary_info">Dietary Information (comma separated)</Label>
              <Textarea
                id="dietary_info"
                value={formData.dietary_info.join(', ')}
                onChange={(e) => handleArrayChange('dietary_info', e.target.value)}
                placeholder="Vegetarian, Gluten-Free, Low Sugar..."
                rows={2}
              />
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
          disabled={loading || !formData.name || !formData.price || !formData.category}
          onClick={() => document.getElementById('create-product-form').requestSubmit()}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateProductModal;