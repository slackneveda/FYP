import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';
import CreateCategoryModal from '@/components/admin/forms/CreateCategoryModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    product_count: 0,
    order: 0
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getCategories(currentPage, 20, search);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchCategories]);

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(categoryId);
      await AdminApiService.deleteCategory(categoryId);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        product_count: category.product_count || 0,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        product_count: 0,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      product_count: 0,
      order: 0
    });
  };

  const handleCategoryCreated = () => {
    fetchCategories();
    setShowCreateModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await AdminApiService.updateCategory(editingCategory.id, formData);
      } else {
        await AdminApiService.createCategory(formData);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'product_count' || name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
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
            <AuroraText>Categories Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage dessert categories and their organization
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Category
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchCategories} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Categories Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Slug</th>
                <th className="text-left p-4 font-semibold">Products</th>
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Created</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{category.product_count}</p>
                      <p className="text-xs text-muted-foreground">products</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">
                      {category.order}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(category)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteLoading === category.id}
                        className="text-xs"
                      >
                        {deleteLoading === category.id ? (
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

        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-6">
              {search ? 'Try adjusting your search terms.' : 'Create your first category to get started.'}
            </p>
            <Button onClick={() => handleOpenModal()}>
              Add Category
            </Button>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} categories
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
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug *
              </label>
              <Input
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="category-slug"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL
              </label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Count
                </label>
                <Input
                  name="product_count"
                  type="number"
                  value={formData.product_count}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Order
                </label>
                <Input
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Create Category Modal */}
      {showCreateModal && (
        <CreateCategoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCategoryCreated={handleCategoryCreated}
        />
      )}
    </div>
  );
};

export default AdminCategories;