import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';

const AdminChefRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [formData, setFormData] = useState({
    chef_name: '',
    chef_image: '',
    chef_title: '',
    recommendation_text: '',
    dessert_item: '',
    is_featured: false
  });

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getChefRecommendations(currentPage, 20, searchTerm);
      setRecommendations(data.recommendations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch chef recommendations:', error);
      setError('Failed to load chef recommendations');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

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
      fetchRecommendations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchRecommendations]);

  const handleDeleteRecommendation = async (recommendationId) => {
    if (!window.confirm('Are you sure you want to delete this chef recommendation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(recommendationId);
      await AdminApiService.deleteChefRecommendation(recommendationId);
      await fetchRecommendations();
    } catch (error) {
      console.error('Failed to delete chef recommendation:', error);
      alert('Failed to delete chef recommendation: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (recommendation = null) => {
    if (recommendation) {
      setEditingRecommendation(recommendation);
      setFormData({
        chef_name: recommendation.chef_name,
        chef_image: recommendation.chef_image || '',
        chef_title: recommendation.chef_title || '',
        recommendation_text: recommendation.recommendation_text,
        dessert_item: recommendation.dessert_item || '',
        is_featured: recommendation.is_featured
      });
    } else {
      setEditingRecommendation(null);
      setFormData({
        chef_name: '',
        chef_image: '',
        chef_title: '',
        recommendation_text: '',
        dessert_item: '',
        is_featured: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecommendation(null);
    setFormData({
      chef_name: '',
      chef_image: '',
      chef_title: '',
      recommendation_text: '',
      dessert_item: '',
      is_featured: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        dessert_item: formData.dessert_item || null
      };
      
      if (editingRecommendation) {
        await AdminApiService.updateChefRecommendation(editingRecommendation.id, submitData);
      } else {
        await AdminApiService.createChefRecommendation(submitData);
      }
      await fetchRecommendations();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save chef recommendation:', error);
      alert('Failed to save chef recommendation: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleFeatured = async (recommendationId, currentFeatured) => {
    try {
      await AdminApiService.updateChefRecommendation(recommendationId, { is_featured: !currentFeatured });
      setRecommendations(recommendations.map(r => 
        r.id === recommendationId ? { ...r, is_featured: !currentFeatured } : r
      ));
    } catch (error) {
      console.error('Failed to update featured status:', error);
      alert('Failed to update featured status: ' + error.message);
    }
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
            <AuroraText>Chef Recommendations</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage chef recommendations and featured content
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search by chef name or dessert..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
          <Button onClick={() => handleOpenModal()}>
            Add Recommendation
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchRecommendations} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {recommendation.chef_image ? (
                  <img 
                    src={recommendation.chef_image} 
                    alt={recommendation.chef_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground">{recommendation.chef_name}</h3>
                  {recommendation.chef_title && (
                    <p className="text-sm text-muted-foreground">{recommendation.chef_title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {recommendation.is_featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                <Badge variant="outline">
                  {new Date(recommendation.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            <blockquote className="text-muted-foreground italic border-l-4 border-primary/20 pl-4 mb-4">
              "{recommendation.recommendation_text}"
            </blockquote>

            {recommendation.dessert_item_name && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Recommends:</span> {recommendation.dessert_item_name}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(recommendation)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant={recommendation.is_featured ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => toggleFeatured(recommendation.id, recommendation.is_featured)}
                  className="text-xs"
                >
                  {recommendation.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRecommendation(recommendation.id)}
                disabled={deleteLoading === recommendation.id}
                className="text-xs"
              >
                {deleteLoading === recommendation.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-2">No chef recommendations found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? 'Try adjusting your search.' : 'Add your first chef recommendation to get started.'}
          </p>
          <Button onClick={() => handleOpenModal()}>
            Add Recommendation
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} recommendations
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
            {editingRecommendation ? 'Edit Chef Recommendation' : 'Add New Chef Recommendation'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chef Name *
              </label>
              <Input
                name="chef_name"
                value={formData.chef_name}
                onChange={handleInputChange}
                placeholder="Enter chef name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chef Title/Position
              </label>
              <Input
                name="chef_title"
                value={formData.chef_title}
                onChange={handleInputChange}
                placeholder="e.g., Executive Chef, Pastry Chef"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chef Image URL
              </label>
              <Input
                name="chef_image"
                value={formData.chef_image}
                onChange={handleInputChange}
                placeholder="https://example.com/chef-photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recommendation Text *
              </label>
              <textarea
                name="recommendation_text"
                value={formData.recommendation_text}
                onChange={handleInputChange}
                placeholder="Enter chef's recommendation"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recommended Dessert (Optional)
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
                name="is_featured"
                id="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="rounded border-border"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                Feature this recommendation
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRecommendation ? 'Update Recommendation' : 'Create Recommendation'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminChefRecommendations;