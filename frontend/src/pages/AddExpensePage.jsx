import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const AddExpensePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    type: 'expense', // 'expense' or 'income'
    tagIds: [], // Array of selected tag IDs
    date: new Date().toISOString().split('T')[0]
  });
  
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch available tags
  const fetchTags = async () => {
    try {
      setLoadingTags(true);

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
              }
            }
          `
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error fetching tags');
      }

      setAvailableTags(result.data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.message);
    } finally {
      setLoadingTags(false);
    }
  };

  // Function to toggle a tag selection
  const toggleTagSelection = (tagId) => {
    setFormData(prev => {
      if (prev.tagIds.includes(tagId)) {
        return {
          ...prev,
          tagIds: prev.tagIds.filter(id => id !== tagId)
        };
      } else {
        return {
          ...prev,
          tagIds: [...prev.tagIds, tagId]
        };
      }
    });
  };

  // Function to handle expense creation
  const createExpense = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount) {
      setError('Title and amount are required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateExpense($title: String!, $amount: Float!, $date: String!, $tagIds: [ID!]) {
              createExpense(title: $title, amount: $amount, date: $date, tagIds: $tagIds) {
                id
                title
                amount
                date
                user {
                  id
                  name
                }
                tags {
                  id
                  name
                  icon
                }
              }
            }
          `,
          variables: {
            title: formData.title,
            amount: formData.type === 'expense'
              ? parseFloat(formData.amount) * -1
              : parseFloat(formData.amount),
            date: formData.date,
            tagIds: formData.tagIds
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Navigate back to dashboard after successful creation
      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error('Error creating expense:', err);
    } finally {
      setLoading(false);
    }
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
            <p>Please log in to add an expense</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Create a new expense entry with tags</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createExpense} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title"
                  placeholder="Enter expense title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Add an optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 min-h-12 p-2 border rounded-md">
                  {loadingTags ? (
                    <div className="text-sm text-muted-foreground">Loading tags...</div>
                  ) : availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.tagIds.includes(tag.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleTagSelection(tag.id);
                        }}
                      >
                        {tag.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No tags available</div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Select one or more tags to categorize this expense</p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Expense'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpensePage;