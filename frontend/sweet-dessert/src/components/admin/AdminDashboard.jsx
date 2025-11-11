import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AuroraText } from '@/components/ui/aurora-text';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import AdminApiService from '@/services/adminApi';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.is_admin) {
      fetchDashboardData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug log
  console.log('AdminDashboard render - authLoading:', authLoading, 'user:', user, 'loading:', loading);

  // Check if user is admin
  if (!authLoading && (!user || !user.is_admin)) {
    console.log('Redirecting to /dashboard - user not admin');
    return <Navigate to="/dashboard" replace />;
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== FRONTEND DASHBOARD DEBUG ===');
      console.log('Fetching dashboard data...');
      console.log('User:', user);
      console.log('API URL:', 'http://127.0.0.1:8000/api/admin/dashboard/');
      
      const data = await AdminApiService.getDashboardStats();
      console.log('Dashboard data received:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
      console.error('Error details:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      case 'picked_up':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'processing':
      case 'confirmed':
      case 'ready':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'cancelled':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-foreground">Loading dashboard...</p>
            </div>
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
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              <AuroraText>Admin Dashboard</AuroraText>
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username || 'Admin'}! Here's your Sweet Dessert admin overview.
            </p>
            {!dashboardData && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
                <p className="text-yellow-800">Dashboard data is loading or unavailable. Please check the console for errors.</p>
              </div>
            )}
          </div>

          {/* Stats Cards with 3D Effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
            {/* Total Users */}
            <CardContainer className="inter-var" containerClassName="py-2">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[18rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <CardItem
                      translateZ="100"
                      className="bg-blue-500 p-3 rounded-full"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5l-6 6m0 0l-6-6m6 6v9" />
                      </svg>
                    </CardItem>
                    <div>
                      <CardItem
                        translateZ="60"
                        className="text-lg font-semibold text-blue-900"
                      >
                        Total Users
                      </CardItem>
                      <CardItem
                        translateZ="80"
                        className="text-3xl font-bold text-blue-700"
                      >
                        {dashboardData?.stats?.total_users?.toLocaleString() || 0}
                      </CardItem>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* Total Orders */}
            <CardContainer className="inter-var" containerClassName="py-2">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[18rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <CardItem
                      translateZ="100"
                      className="bg-green-500 p-3 rounded-full"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </CardItem>
                    <div>
                      <CardItem
                        translateZ="60"
                        className="text-lg font-semibold text-green-900"
                      >
                        Total Orders
                      </CardItem>
                      <CardItem
                        translateZ="80"
                        className="text-3xl font-bold text-green-700"
                      >
                        {dashboardData?.stats?.total_orders?.toLocaleString() || 0}
                      </CardItem>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* Total Revenue */}
            <CardContainer className="inter-var" containerClassName="py-2">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[18rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <CardItem
                      translateZ="100"
                      className="bg-purple-500 p-3 rounded-full"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </CardItem>
                    <div>
                      <CardItem
                        translateZ="60"
                        className="text-lg font-semibold text-purple-900"
                      >
                        Total Revenue
                      </CardItem>
                      <CardItem
                        translateZ="80"
                        className="text-3xl font-bold text-purple-700"
                      >
                        {formatPriceWithCurrency(dashboardData?.stats?.total_revenue || 0)}
                      </CardItem>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* Total Products */}
            <CardContainer className="inter-var" containerClassName="py-2">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[18rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <CardItem
                      translateZ="100"
                      className="bg-orange-500 p-3 rounded-full"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </CardItem>
                    <div>
                      <CardItem
                        translateZ="60"
                        className="text-lg font-semibold text-orange-900"
                      >
                        Total Products
                      </CardItem>
                      <CardItem
                        translateZ="80"
                        className="text-3xl font-bold text-orange-700"
                      >
                        {dashboardData?.stats?.total_products?.toLocaleString() || 0}
                      </CardItem>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Monthly Revenue */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPriceWithCurrency(dashboardData?.stats?.monthly_revenue || 0)}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Total Categories */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.total_categories || 0}
                  </p>
                </div>
                <div className="bg-secondary/50 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Pending Contacts */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pending Contacts</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.pending_contacts || 0}
                  </p>
                </div>
                <div className="bg-accent/50 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {dashboardData?.recent_orders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="font-semibold text-foreground">{formatPriceWithCurrency(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Users */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Recent Users</h2>
              <div className="space-y-4">
                {dashboardData?.recent_users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-secondary/50 p-2 rounded-full">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(user.date_joined)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Status Overview */}
          {dashboardData?.order_statuses && dashboardData.order_statuses.length > 0 && (
            <Card className="p-6 mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Order Status Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardData.order_statuses.map((status) => (
                  <div key={status.status} className="text-center">
                    <p className="text-2xl font-bold text-primary">{status.count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status.status}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Popular Products */}
          {dashboardData?.popular_products && dashboardData.popular_products.length > 0 && (
            <Card className="p-6 mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Popular Products</h2>
              <div className="space-y-3">
                {dashboardData.popular_products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.total_quantity} units sold
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatPriceWithCurrency(product.total_revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;