// cSpell:ignore conv
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Search
} from 'lucide-react';
import ApiService from '@/services/api';

const AdminChatAssistant = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, all
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/chat/analytics/?range=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching chat analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Conversations',
      value: analytics?.total_conversations || 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Orders via Chat',
      value: analytics?.orders_via_chat || 0,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Unique Users',
      value: analytics?.unique_users || 0,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Avg Response Time',
      value: `${analytics?.avg_response_time || 0}ms`,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const popularProducts = analytics?.popular_products || [];
  const recentConversations = analytics?.recent_conversations || [];
  const commonQueries = analytics?.common_queries || [];
  const conversionRate = analytics?.conversion_rate || 0;

  const filteredConversations = recentConversations.filter(conv =>
    conv.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.session_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat Assistant Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI chat performance and customer interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2 text-foreground">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Rate & Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Chat to Order</span>
                    <span className="text-sm font-bold text-foreground">{conversionRate}%</span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {analytics?.successful_orders || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Successful Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">
                    {analytics?.abandoned_carts || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Abandoned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Products via Chat */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Top Products via Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {popularProducts.length > 0 ? (
                popularProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {product.count} orders
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Queries */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Most Common Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonQueries.length > 0 ? (
              commonQueries.map((query, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{query.query}</p>
                    <Badge variant="outline" className="ml-2">{query.count}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intent: <span className="font-medium text-primary">{query.intent}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-8">No queries logged yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Conversations
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={conv.action === 'add_to_cart' ? 'default' : 'secondary'}>
                          {conv.action || 'info'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Session: {conv.session_id?.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{conv.message}</p>
                      {conv.response && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Response: {conv.response}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {conv.products && conv.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Products:</p>
                      <div className="flex flex-wrap gap-2">
                        {conv.products.map((product, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? 'No matching conversations found' : 'No conversations yet'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-foreground">Chat Assistant Status</h3>
                <p className="text-sm text-muted-foreground">
                  ChromaDB: <span className="font-medium text-foreground">{analytics?.chroma_status || 'Unknown'}</span> • 
                  Vector DB Docs: <span className="font-medium text-foreground">{analytics?.vector_db_count || 0}</span> • 
                  OpenRouter: <span className="font-medium text-foreground">Active</span>
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">Online</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatAssistant;
