import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';
import CreateProductModal from '@/components/admin/forms/CreateProductModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_featured: false,
    is_available: true,
    dietary_info: '',
    ingredients: '',
    preparation_time: '',
    serving_size: '',
    calories: '',
    allergens: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getProducts(currentPage, 20, search, categoryFilter);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Auto-refresh products every 30 seconds to sync with Django admin changes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing products from backend...');
      fetchProducts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await AdminApiService.getAllCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || '',
        image: product.image || '',
        is_featured: product.featured || false,
        is_available: product.available !== false,
        dietary_info: product.dietary_info || '',
        ingredients: product.ingredients || '',
        preparation_time: product.preparation_time || '',
        serving_size: product.serving_size || '',
        calories: product.calories || '',
        allergens: product.allergens || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        is_featured: false,
        is_available: true,
        dietary_info: '',
        ingredients: '',
        preparation_time: '',
        serving_size: '',
        calories: '',
        allergens: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      is_featured: false,
      is_available: true,
      dietary_info: '',
      ingredients: '',
      preparation_time: '',
      serving_size: '',
      calories: '',
      allergens: ''
    });
  };

  const handleProductCreated = () => {
    fetchProducts();
    setShowCreateModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map frontend field names to backend field names
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category || null,
        image: formData.image,
        featured: formData.is_featured,  // Map is_featured to featured
        available: formData.is_available,  // Map is_available to available
        dietary_info: formData.dietary_info,
        ingredients: formData.ingredients,
        preparation_time: formData.preparation_time,
        serving_size: formData.serving_size,
        calories: formData.calories ? parseInt(formData.calories) : null,
        allergens: formData.allergens
      };
      
      if (editingProduct) {
        await AdminApiService.updateProduct(editingProduct.id, submitData);
      } else {
        await AdminApiService.createProduct(submitData);
      }
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(productId);
      await AdminApiService.deleteProduct(productId);
      // Remove product from local state
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <AuroraText>Products Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage your dessert products and their details
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={fetchProducts} 
            variant="outline"
            disabled={loading}
            title="Refresh products from database"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchProducts} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Features</th>
                <th className="text-left p-4 font-semibold">Rating</th>
                <th className="text-left p-4 font-semibold">Created</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                        <div className="w-full h-full bg-primary/10 items-center justify-center" style={{display: 'none'}}>
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.preparation_time} min prep
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">
                      {product.category_name || 'No Category'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </td>
                  <td className="p-4">
                    <Badge variant={product.available ? 'default' : 'secondary'}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <Badge variant="default" className="text-xs">Featured</Badge>
                      )}
                      {product.best_seller && (
                        <Badge variant="secondary" className="text-xs">Best Seller</Badge>
                      )}
                      {product.seasonal && (
                        <Badge variant="outline" className="text-xs">Seasonal</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{product.rating || '0.0'}</span>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews_count || 0})
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleOpenModal(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteLoading === product.id}
                        className="text-xs"
                      >
                        {deleteLoading === product.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {search || categoryFilter ? 'Try adjusting your filters.' : 'Start by adding your first product.'}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} products
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
        <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL
                </label>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/product-image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preparation Time
                </label>
                <Input
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Serving Size
                </label>
                <Input
                  name="serving_size"
                  value={formData.serving_size}
                  onChange={handleInputChange}
                  placeholder="e.g., 1 slice, 2 pieces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Calories
                </label>
                <Input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ingredients
              </label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                placeholder="List the main ingredients"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dietary Information
                </label>
                <Input
                  name="dietary_info"
                  value={formData.dietary_info}
                  onChange={handleInputChange}
                  placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Allergens
                </label>
                <Input
                  name="allergens"
                  value={formData.allergens}
                  onChange={handleInputChange}
                  placeholder="e.g., Contains nuts, dairy, eggs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-border"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                  Featured product
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_available"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="rounded border-border"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-foreground">
                  Available for order
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProductCreated={handleProductCreated}
        />
      )}
    </div>
  );
};

export default AdminProducts;