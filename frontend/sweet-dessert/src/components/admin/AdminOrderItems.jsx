import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';

const AdminOrderItems = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState(null);
  const [formData, setFormData] = useState({
    order: '',
    dessert_item: '',
    quantity: 1,
    price: '',
    customizations: ''
  });

  const fetchOrderItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getOrderItems(currentPage, 20, orderFilter, searchTerm);
      setOrderItems(data.order_items);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch order items:', error);
      setError('Failed to load order items');
    } finally {
      setLoading(false);
    }
  }, [currentPage, orderFilter, searchTerm]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await AdminApiService.getOrders(1, 100);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, []);

  const fetchDesserts = useCallback(async () => {
    try {
      const data = await AdminApiService.getAllDesserts();
      setDesserts(data.results || data);
    } catch (error) {
      console.error('Failed to fetch desserts:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchDesserts();
  }, [fetchOrders, fetchDesserts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrderItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchOrderItems]);

  const handleDeleteOrderItem = async (orderItemId) => {
    if (!window.confirm('Are you sure you want to delete this order item? This action cannot be undone and will affect the order total.')) {
      return;
    }

    try {
      setDeleteLoading(orderItemId);
      await AdminApiService.deleteOrderItem(orderItemId);
      await fetchOrderItems();
    } catch (error) {
      console.error('Failed to delete order item:', error);
      alert('Failed to delete order item: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderFilter = (value) => {
    setOrderFilter(value);
    setCurrentPage(1);
  };

  const handleOpenModal = (orderItem = null) => {
    if (orderItem) {
      setEditingOrderItem(orderItem);
      setFormData({
        order: orderItem.order,
        dessert_item: orderItem.dessert_item,
        quantity: orderItem.quantity,
        price: orderItem.price.toString(),
        customizations: typeof orderItem.customizations === 'object' ? 
          JSON.stringify(orderItem.customizations, null, 2) : 
          orderItem.customizations || ''
      });
    } else {
      setEditingOrderItem(null);
      setFormData({
        order: '',
        dessert_item: '',
        quantity: 1,
        price: '',
        customizations: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrderItem(null);
    setFormData({
      order: '',
      dessert_item: '',
      quantity: 1,
      price: '',
      customizations: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let customizations = null;
      
      if (formData.customizations.trim()) {
        try {
          customizations = JSON.parse(formData.customizations);
        } catch {
          customizations = formData.customizations;
        }
      }

      const submitData = {
        order: formData.order,
        dessert_item: formData.dessert_item,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        customizations: customizations
      };
      
      if (editingOrderItem) {
        await AdminApiService.updateOrderItem(editingOrderItem.id, submitData);
      } else {
        await AdminApiService.createOrderItem(submitData);
      }
      await fetchOrderItems();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save order item:', error);
      alert('Failed to save order item: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCustomizations = (customizations) => {
    if (!customizations) return 'None';
    if (typeof customizations === 'string') return customizations;
    if (typeof customizations === 'object') {
      return Object.entries(customizations)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return JSON.stringify(customizations);
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
            <AuroraText>Order Items Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage individual items within orders
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search by dessert name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
          <select
            value={orderFilter}
            onChange={(e) => handleOrderFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Orders</option>
            {orders.slice(0, 20).map(order => (
              <option key={order.id} value={order.id}>
                {order.order_number} - {order.customer_name}
              </option>
            ))}
          </select>
          <Button onClick={() => handleOpenModal()}>
            Add Order Item
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchOrderItems} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Order Items Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Order</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Dessert</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Customizations</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orderItems.map((orderItem) => (
                <tr key={orderItem.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {orderItem.order_number || `Order #${orderItem.order}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {orderItem.customer_name || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {orderItem.dessert_image && (
                        <img 
                          src={orderItem.dessert_image} 
                          alt={orderItem.dessert_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {orderItem.product_name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order: {orderItem.order_number || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {orderItem.quantity}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      ${parseFloat(orderItem.unit_price || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">
                      ${parseFloat(orderItem.total_price || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {formatCustomizations(orderItem.customizations)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(orderItem)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrderItem(orderItem.id)}
                        disabled={deleteLoading === orderItem.id}
                      >
                        {deleteLoading === orderItem.id ? (
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
      </Card>

      {orderItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-2">No order items found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || orderFilter ? 'Try adjusting your filters.' : 'Add your first order item to get started.'}
          </p>
          <Button onClick={() => handleOpenModal()}>
            Add Order Item
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} order items
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
            {editingOrderItem ? 'Edit Order Item' : 'Add New Order Item'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Order *
              </label>
              <select
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="">Select an order</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {order.customer_name} (${order.total_amount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dessert Item *
              </label>
              <select
                name="dessert_item"
                value={formData.dessert_item}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="">Select a dessert</option>
                {desserts.map(dessert => (
                  <option key={dessert.id} value={dessert.id}>
                    {dessert.name} - ${dessert.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
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
                Customizations (JSON format or plain text)
              </label>
              <textarea
                name="customizations"
                value={formData.customizations}
                onChange={handleInputChange}
                placeholder='{"size": "large", "frosting": "chocolate"} or plain text'
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter customizations as JSON object or plain text
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingOrderItem ? 'Update Order Item' : 'Create Order Item'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrderItems;