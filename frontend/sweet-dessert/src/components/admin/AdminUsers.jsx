import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import AdminApiService from '@/services/adminApi';
import { formatPriceWithCurrency } from '@/utils/priceUtils';
import CreateUserModal from '@/components/admin/forms/CreateUserModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getUsers(currentPage, 20, search);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(userId);
      await AdminApiService.deleteUser(userId);
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleUserCreated = (newUser) => {
    // Add the new user to the beginning of the list
    setUsers(prev => [newUser, ...prev]);
    setShowCreateModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <AuroraText>Users Management</AuroraText>
          </h1>
          <p className="text-muted-foreground">
            Manage registered users and their accounts
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </Button>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchUsers} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Orders</th>
                <th className="text-left p-4 font-semibold">Total Spent</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-left p-4 font-semibold">Last Login</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        {(user.first_name || user.last_name) && (
                          <p className="text-sm text-muted-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-col space-y-1">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.is_superuser && (
                        <Badge variant="destructive" className="text-xs">Admin</Badge>
                      )}
                      {user.is_staff && !user.is_superuser && (
                        <Badge variant="outline" className="text-xs">Staff</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{user.total_orders}</p>
                      <p className="text-xs text-muted-foreground">orders</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-primary">
                      {formatPriceWithCurrency(user.total_spent)}
                    </p>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(user.date_joined)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDateTime(user.last_login)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteLoading === user.id || user.is_superuser}
                        className="text-xs"
                      >
                        {deleteLoading === user.id ? (
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

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5l-6 6m0 0l-6-6m6 6v9" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} users
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default AdminUsers;