import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AuroraText } from '@/components/ui/aurora-text';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/dashboard/', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Redirect admin users to admin dashboard
  if (user?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium';
      case 'processing':
      case 'preparing':
        return 'bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              <AuroraText>Welcome back, {user?.username}!</AuroraText>
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your Sweet Dessert account
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Profile Card */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
                  <p className="text-2xl font-bold text-card-foreground">{user?.username}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {dashboardData?.user?.date_joined ? formatDate(dashboardData.user.date_joined) : 'N/A'}
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-secondary/50 p-2 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                  <p className="text-2xl font-bold text-card-foreground">
                    {dashboardData?.stats?.total_orders || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">All time orders</p>
            </div>

            {/* Total Spent */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-accent/50 p-2 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
                  <p className="text-2xl font-bold text-card-foreground">
                    {formatPriceWithCurrency(dashboardData?.stats?.total_spent || 0)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Lifetime spending</p>
            </div>

            {/* Account Status */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-muted/50 p-2 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Account Status</h3>
                  <p className="text-2xl font-bold text-primary">Active</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Verified account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-card-foreground">Recent Orders</h2>
                </div>
                <div className="p-6">
                  {dashboardData?.orders && dashboardData.orders.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">Order #{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(order.created_at)} • {order.items_count} items
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                            </span>
                            <div className="text-right">
                              <p className="font-semibold text-card-foreground">{formatPriceWithCurrency(order.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-medium text-card-foreground mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start shopping to see your order history!
                      </p>
                      <a 
                        href="/menu" 
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        Browse Menu
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details & Quick Actions */}
            <div className="space-y-6">
              {/* Account Details */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-card-foreground">Account Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Username
                    </label>
                    <p className="text-card-foreground font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Email Address
                    </label>
                    <p className="text-card-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Member Since
                    </label>
                    <p className="text-card-foreground">
                      {dashboardData?.user?.date_joined ? formatDate(dashboardData.user.date_joined) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-card-foreground">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <a 
                    href="/menu" 
                    className="flex items-center p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    <div className="bg-primary/10 p-2 rounded-full mr-3 group-hover:bg-primary/20 transition-colors">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Browse Menu</h3>
                      <p className="text-sm text-muted-foreground">Explore our delicious desserts</p>
                    </div>
                  </a>
                  
                  <a 
                    href="/featured" 
                    className="flex items-center p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    <div className="bg-secondary/50 p-2 rounded-full mr-3 group-hover:bg-primary/20 transition-colors">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Featured Items</h3>
                      <p className="text-sm text-muted-foreground">Check out our special offerings</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;