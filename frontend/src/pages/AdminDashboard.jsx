import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [sqlQuery, setSqlQuery] = useState('');
  const [graphqlQuery, setGraphqlQuery] = useState('');
  const [commandResult, setCommandResult] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query GetAdminUsers {
              adminUsers {
                id
                name
                email
                isAdmin
                createdAt
                updatedAt
              }
            }
          `
        })
      });

      const result = await response.json();
      
      if (!result.errors) {
        setUsers(result.data.allUsers || []);
      } else {
        throw new Error(result.errors[0]?.message || 'Error fetching users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Handle form changes
  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateUser($input: CreateUserInput!) {
              createUser(input: $input) {
                id
                name
                email
                isAdmin
                createdAt
                updatedAt
              }
            }
          `,
          variables: { 
            input: {
              ...userForm,
              password: userForm.password || undefined  // Don't send empty password
            }
          }
        })
      });

      const result = await response.json();
      
      if (!result.errors) {
        setUserForm({ name: '', email: '', password: '', isAdmin: false });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.errors[0]?.message || 'Error creating user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  // Handle update user
  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
              updateUser(id: $id, input: $input) {
                id
                name
                email
                isAdmin
                createdAt
                updatedAt
              }
            }
          `,
          variables: { id: userId, input: updates }
        })
      });

      const result = await response.json();
      
      if (!result.errors) {
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.errors[0]?.message || 'Error updating user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  // Handle delete user confirmation
  const confirmDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteAlert(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation DeleteUser($id: ID!) {
              deleteUser(id: $id)
            }
          `,
          variables: { id: selectedUserId }
        })
      });

      const result = await response.json();
      
      if (!result.errors) {
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.errors[0]?.message || 'Error deleting user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setShowDeleteAlert(false);
      setSelectedUserId(null);
    }
  };

  // Handle SQL query execution
  const executeSqlQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setCommandLoading(true);
    setCommandResult('Executing...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation ExecuteSQL($query: String!) {
              executeSQL(query: $query)
            }
          `,
          variables: { query: sqlQuery }
        })
      });

      const result = await response.json();
      
      if (!result.errors) {
        setCommandResult(JSON.stringify(result.data.executeSQL, null, 2));
      } else {
        setCommandResult(`Error: ${result.errors[0]?.message}`);
      }
    } catch (err) {
      setCommandResult(`Error: ${err.message}`);
    } finally {
      setCommandLoading(false);
    }
  };

  // Handle GraphQL query execution
  const executeGraphqlQuery = async () => {
    if (!graphqlQuery.trim()) return;
    
    setCommandLoading(true);
    setCommandResult('Executing...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: graphqlQuery
        })
      });

      const result = await response.json();
      setCommandResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setCommandResult(`Error: ${err.message}`);
    } finally {
      setCommandLoading(false);
    }
  };

  // Toggle user admin status
  const toggleAdminStatus = async (user) => {
    await handleUpdateUser(user.id, { isAdmin: !user.isAdmin });
  };

  // Change user password
  const changeUserPassword = async (userId, newPassword) => {
    if (!newPassword) return;
    
    await handleUpdateUser(userId, { password: newPassword });
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be an administrator to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Manage users and execute administrative commands</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="sql">SQL Query</TabsTrigger>
                <TabsTrigger value="graphql">GraphQL Query</TabsTrigger>
              </TabsList>

              {/* User Management Tab */}
              <TabsContent value="users">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Creation Form */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create User</CardTitle>
                        <CardDescription>Add a new user to the system</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={userForm.name}
                              onChange={handleUserFormChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={userForm.email}
                              onChange={handleUserFormChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              value={userForm.password}
                              onChange={handleUserFormChange}
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              id="isAdmin"
                              name="isAdmin"
                              type="checkbox"
                              checked={userForm.isAdmin}
                              onChange={handleUserFormChange}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="isAdmin">Admin User</Label>
                          </div>

                          <Button type="submit" className="w-full">
                            Create User
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* User List */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage existing users in the system</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {usersLoading ? (
                          <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <div className="overflow-auto max-h-[500px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Created</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.map(user => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      <Badge variant={user.isAdmin ? "secondary" : "outline"}>
                                        {user.isAdmin ? "Admin" : "User"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleAdminStatus(user)}
                                        >
                                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const newPassword = prompt('Enter new password:');
                                            if (newPassword) changeUserPassword(user.id, newPassword);
                                          }}
                                        >
                                          Change Password
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => confirmDeleteUser(user.id)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            {users.length === 0 && (
                              <div className="text-center py-10 text-muted-foreground">
                                No users found
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* SQL Query Tab */}
              <TabsContent value="sql">
                <Card>
                  <CardHeader>
                    <CardTitle>Execute SQL Query</CardTitle>
                    <CardDescription>Run direct SQL queries against the database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sql-query">SQL Query</Label>
                        <Textarea
                          id="sql-query"
                          value={sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          placeholder="SELECT * FROM users;"
                          rows={6}
                        />
                      </div>
                      
                      <Button onClick={executeSqlQuery} disabled={commandLoading} className="w-full">
                        {commandLoading ? 'Executing...' : 'Execute Query'}
                      </Button>
                      
                      {commandResult && (
                        <div>
                          <Label>Result</Label>
                          <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-md font-mono text-sm overflow-auto max-h-60">
                            <pre>{commandResult}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* GraphQL Query Tab */}
              <TabsContent value="graphql">
                <Card>
                  <CardHeader>
                    <CardTitle>Execute GraphQL Query</CardTitle>
                    <CardDescription>Run GraphQL queries against the API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="graphql-query">GraphQL Query/Mutation</Label>
                        <Textarea
                          id="graphql-query"
                          value={graphqlQuery}
                          onChange={(e) => setGraphqlQuery(e.target.value)}
                          placeholder={`query { users { id name email } }`}
                          rows={8}
                        />
                      </div>
                      
                      <Button onClick={executeGraphqlQuery} disabled={commandLoading} className="w-full">
                        {commandLoading ? 'Executing...' : 'Execute Query'}
                      </Button>
                      
                      {commandResult && (
                        <div>
                          <Label>Result</Label>
                          <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-md font-mono text-sm overflow-auto max-h-60">
                            <pre>{commandResult}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;