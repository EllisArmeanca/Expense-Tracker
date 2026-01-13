import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query AdminUsers {
              adminUsers {
                id
                name
                email
                isAdmin
                createdAt
              }
            }
          `
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setUsers(result.data.adminUsers);
    } catch (error) {
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentAdminStatus) => {
    try {
      const mutation = currentAdminStatus 
        ? `
          mutation DemoteFromAdmin($id: ID!) {
            demoteFromAdmin(id: $id) {
              id
              name
              email
              isAdmin
            }
          }
        `
        : `
          mutation PromoteToAdmin($id: ID!) {
            promoteToAdmin(id: $id) {
              id
              name
              email
              isAdmin
            }
          }
        `;

      const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: userId }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Update the local state to reflect the change
      const updatedUsers = users.map(u => 
        u.id === userId 
          ? { ...u, isAdmin: result.data[currentAdminStatus ? 'demoteFromAdmin' : 'promoteToAdmin'].isAdmin } 
          : u
      );
      
      setUsers(updatedUsers);
      
      toast.success(currentAdminStatus 
        ? 'User demoted from admin successfully!' 
        : 'User promoted to admin successfully!');
    } catch (error) {
      toast.error(`Failed to update admin status: ${error.message}`);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading users...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage users and their admin privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant={user.isAdmin ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        disabled={user.email === localStorage.getItem('currentUserEmail')} // Prevent self demotion
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-8">
              <p>No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;