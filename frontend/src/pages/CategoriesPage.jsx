import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';

const CategoriesPage = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });

  // Fetch user's tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query GetTags {
              tags {
                id
                name
                icon
                createdAt
              }
            }
          `
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error fetching tags');
      }

      setTags(result.data.tags || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission for creating/editing tags
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setError('');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: editingTag
            ? `
                mutation UpdateTag($id: ID!, $name: String!, $icon: String) {
                  updateTag(id: $id, name: $name, icon: $icon) {
                    id
                    name
                    icon
                    createdAt
                  }
                }
              `
            : `
                mutation CreateTag($name: String!, $icon: String) {
                  createTag(name: $name, icon: $icon) {
                    id
                    name
                    icon
                    createdAt
                  }
                }
              `,
          variables: editingTag 
            ? { id: editingTag.id, name: formData.name.trim(), icon: formData.icon.trim() || null }
            : { name: formData.name.trim(), icon: formData.icon.trim() || null }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || (editingTag ? 'Error updating tag' : 'Error creating tag'));
      }

      // Refresh the tags list
      fetchTags();

      // Reset form and close dialog
      setFormData({ name: '', icon: '' });
      setEditingTag(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err.message);
      console.error(editingTag ? 'Error updating tag:' : 'Error creating tag:', err);
    }
  };

  // Handle tag deletion
  const handleDelete = async () => {
    try {
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation DeleteTag($id: ID!) {
              deleteTag(id: $id)
            }
          `,
          variables: { id: deleteTagId }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error deleting tag');
      }

      // Refresh the tags list
      fetchTags();

      // Close dialog
      setIsDeleteDialogOpen(false);
      setDeleteTagId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting tag:', err);
    }
  };

  // Handle edit button click
  const handleEditClick = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      icon: tag.icon || ''
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (tagId) => {
    setDeleteTagId(tagId);
    setIsDeleteDialogOpen(true);
  };

  // Reset form when opening create dialog
  const handleCreateClick = () => {
    setEditingTag(null);
    setFormData({ name: '', icon: '' });
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to manage your tags</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Your Tags</CardTitle>
            <CardDescription>Manage your personal tags for categorizing expenses and income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-6">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateClick}>Add New Tag</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
                    <DialogDescription>
                      {editingTag 
                        ? 'Modify the name and icon for your tag' 
                        : 'Create a new tag to categorize your expenses and income'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input 
                        id="name"
                        name="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Groceries, Rent, Salary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon (optional)</Label>
                      <Input 
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        placeholder="e.g., 🛒, 🏠, 💰"
                      />
                      <p className="text-xs text-muted-foreground">
                        You can use emojis or an icon class name
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingTag ? 'Update Tag' : 'Create Tag'}
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </DialogClose>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You haven't created any tags yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first tag to start organizing your expenses!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tags.map(tag => (
                  <Card key={tag.id} className="flex justify-between items-center p-4">
                    <div>
                      {tag.icon && <span className="mr-2">{tag.icon}</span>}
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditClick(tag)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteClick(tag.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the tag and remove it from any associated expenses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteTagId(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoriesPage;