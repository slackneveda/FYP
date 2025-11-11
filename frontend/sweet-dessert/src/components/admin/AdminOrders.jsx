import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';
import { formatPriceWithCurrency } from '@/utils/priceUtils';
import CreateOrderModal from '@/components/admin/forms/CreateOrderModal';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

const AdminOrders = () => {
  console.log('AdminOrders component rendering...');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const orderStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders...', { currentPage, search, statusFilter });
      const data = await AdminApiService.getOrders(currentPage, 20, search, statusFilter);
      console.log('Orders response:', data);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(`Failed to load orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdateLoading(orderId);
      await AdminApiService.updateOrder(orderId, { status: newStatus });
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order: ' + error.message);
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(orderId);
      await AdminApiService.deleteOrder(orderId);
      // Remove order from local state
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleOrderCreated = (newOrder) => {
    // Add the new order to the beginning of the list
    setOrders(prev => [newOrder, ...prev]);
    setShowCreateModal(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
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

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading orders</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <Button onClick={fetchOrders}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <AuroraText>Orders Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage customer orders and their status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </Button>
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchOrders} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Type</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Payment</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      {order.customer_phone && (
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">
                      {order.order_type === 'takeaway' ? '🏪 Pickup' : '🚚 Delivery'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col space-y-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        disabled={updateLoading === order.id}
                        className="px-2 py-1 text-xs border border-border rounded bg-background"
                      >
                        {orderStatuses.slice(1).map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {updateLoading === order.id && (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent mx-auto" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col space-y-1">
                      <Badge variant={order.payment_status === 'succeeded' || order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {order.payment_status === 'succeeded' || order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {order.payment_method === 'online' ? 'Paid Online' : 'Pay at Store'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-primary">
                        {formatPriceWithCurrency(order.total)}
                      </p>
                      {order.delivery_fee > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{formatPriceWithCurrency(order.delivery_fee)} delivery
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deleteLoading === order.id}
                        className="text-xs"
                      >
                        {deleteLoading === order.id ? (
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

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter ? 'Try adjusting your filters.' : 'No orders have been placed yet.'}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} orders
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

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default AdminOrders;