// cspell:disable
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye, 
  Repeat, 
  Star,
  Filter,
  Calendar,
  MapPin,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPriceWithCurrency } from '@/utils/priceUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartProvider';
import { desserts } from '@/data/desserts';
import apiService from '@/services/api';

// Mock orders data for fallback
const mockOrders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-20',
      status: 'delivered',
      total: 45.97,
      estimatedDelivery: '2024-01-22',
      actualDelivery: '2024-01-21',
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Sweet Avenue, Dessert City, DC 12345',
      items: [
        { id: 1, name: 'Chocolate Lava Cake', quantity: 2, price: 12.99, image: desserts[0].image },
        { id: 2, name: 'Strawberry Cheesecake', quantity: 1, price: 9.99, image: desserts[1].image },
        { id: 3, name: 'Macarons Assorted', quantity: 1, price: 18.99, image: desserts[2].image }
      ],
      tracking: {
        orderPlaced: '2024-01-20 14:30',
        preparing: '2024-01-20 15:00',
        outForDelivery: '2024-01-21 09:00',
        delivered: '2024-01-21 11:30'
      }
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-15',
      status: 'delivered',
      total: 32.48,
      estimatedDelivery: '2024-01-17',
      actualDelivery: '2024-01-16',
      paymentMethod: 'PayPal',
      deliveryAddress: '123 Sweet Avenue, Dessert City, DC 12345',
      items: [
        { id: 4, name: 'Tiramisu', quantity: 1, price: 11.99, image: desserts[3].image },
        { id: 7, name: 'Pumpkin Spice Cupcakes', quantity: 4, price: 4.99, image: desserts[6].image }
      ],
      tracking: {
        orderPlaced: '2024-01-15 16:45',
        preparing: '2024-01-15 17:15',
        outForDelivery: '2024-01-16 08:30',
        delivered: '2024-01-16 10:15'
      }
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-10',
      status: 'preparing',
      total: 28.97,
      estimatedDelivery: '2024-01-12',
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Sweet Avenue, Dessert City, DC 12345',
      items: [
        { id: 6, name: 'Vegan Chocolate Mousse', quantity: 2, price: 8.99, image: desserts[5].image },
        { id: 5, name: 'Chocolate Chip Cookies', quantity: 4, price: 2.99, image: desserts[4].image }
      ],
      tracking: {
        orderPlaced: '2024-01-10 12:20',
        preparing: '2024-01-10 13:00',
        outForDelivery: null,
        delivered: null
      }
    },
    {
      id: 'ORD-2024-004',
      date: '2024-01-08',
      status: 'cancelled',
      total: 15.98,
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Sweet Avenue, Dessert City, DC 12345',
      items: [
        { id: 12, name: 'Double Chocolate Brownies', quantity: 2, price: 3.99, image: desserts[11].image },
        { id: 8, name: 'Ice Cream Sundae', quantity: 1, price: 7.99, image: desserts[7].image }
      ],
      cancellationReason: 'Customer requested cancellation'
    }
  ];

const OrdersPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersResponse = await apiService.getOrders();
        
        if (ordersResponse.orders && ordersResponse.orders.length > 0) {
          setOrders(ordersResponse.orders);
        } else {
          // Use mock data if no orders from backend
          setOrders(mockOrders);
        }
      } catch {
        console.warn('Backend unavailable for orders, using mock data');
        setError('Unable to load orders from server. Showing sample data.');
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'shipping':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'shipping':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const dessert = desserts.find(d => d.id === item.id);
      if (dessert) {
        addItem({
          id: dessert.id,
          name: dessert.name,
          price: dessert.price,
          image: dessert.image,
          quantity: item.quantity,
          customizations: {}
        });
      }
    });
    alert('Items added to cart!');
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Error Alert */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mx-4">
          <p className="text-amber-800 dark:text-amber-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">My Orders</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your orders, view order history, and reorder your favorites with ease.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card 
              key={status}
              className={`cursor-pointer transition-all ${
                filterStatus === status ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(status)}
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground capitalize">{status}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search orders by ID or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {filterStatus === 'all' 
                    ? "You haven't placed any orders yet."
                    : `No ${filterStatus} orders found.`
                  }
                </p>
                <Button asChild>
                  <Link to="/menu">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Ordered on {new Date(order.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="text-xl font-bold text-primary">{formatPriceWithCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-3">Items Ordered</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × RS {item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Delivery Information</h4>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {order.status === 'delivered' ? 'Delivered' : 'Expected'}: {' '}
                            {new Date(order.actualDelivery || order.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Payment Method</h4>
                      <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                      {order.cancellationReason && (
                        <div>
                          <h4 className="font-semibold text-red-600">Cancellation Reason</h4>
                          <p className="text-sm text-muted-foreground">{order.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Tracking */}
                  {order.tracking && order.status !== 'cancelled' && (
                    <div>
                      <h4 className="font-semibold mb-3">Order Tracking</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'orderPlaced', label: 'Order Placed', icon: Package },
                          { key: 'preparing', label: 'Preparing', icon: Clock },
                          { key: 'outForDelivery', label: 'Out for Delivery', icon: Truck },
                          { key: 'delivered', label: 'Delivered', icon: CheckCircle }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              order.tracking[key] 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${
                                order.tracking[key] ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {label}
                              </p>
                              {order.tracking[key] && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.tracking[key]).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleReorder(order)}>
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Review Items
                        </Button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-12">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Need Help with Your Order?</h3>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to help with any questions about your orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline">
                Track Package
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;