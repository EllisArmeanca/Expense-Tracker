import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import ExpenseBudgetBox from '@/components/custom/ExpenseBudgetBox';

const StatisticsPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
    includeTags: [],
    excludeTags: []
  });

  // Fetch tags for filtering
  const fetchTags = async () => {
    try {
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
    }
  };

  // Fetch expenses with filters
  const fetchFilteredExpenses = async () => {
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
            query GetExpensesWithFilters($startDate: String, $endDate: String, $tagIds: [ID!], $excludeTagIds: [ID!]) {
              expenses(dateFrom: $startDate, dateTo: $endDate, tagIds: $tagIds, excludeTagIds: $excludeTagIds) {
                id
                title
                amount
                date
                createdAt
                tags {
                  id
                  name
                  icon
                }
              }
            }
          `,
          variables: {
            startDate: filters.startDate,
            endDate: filters.endDate,
            tagIds: filters.includeTags,
            excludeTagIds: filters.excludeTags
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error fetching expenses');
      }

      setExpenses(result.data.expenses || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching filtered expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle tag in include/exclude lists
  const toggleIncludeTag = (tagId) => {
    setFilters(prev => ({
      ...prev,
      includeTags: prev.includeTags.includes(tagId)
        ? prev.includeTags.filter(id => id !== tagId)
        : [...prev.includeTags, tagId]
    }));
  };

  const toggleExcludeTag = (tagId) => {
    setFilters(prev => ({
      ...prev,
      excludeTags: prev.excludeTags.includes(tagId)
        ? prev.excludeTags.filter(id => id !== tagId)
        : [...prev.excludeTags, tagId]
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchFilteredExpenses();
  };

  // Fetch tags and expenses on component mount and when filters change
  useEffect(() => {
    if (user) {
      fetchTags();
      fetchFilteredExpenses(); // Fetch initial data with default filters
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
            <p>Please log in to view statistics</p>
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
            <CardTitle>Expense Statistics</CardTitle>
            <CardDescription>Filter and analyze your expenses by date and tags</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters Section */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Date Range</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tag Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tag Filters</h3>
                  
                  <div className="space-y-4">
                    {/* Include Tags */}
                    <div className="space-y-2">
                      <Label>Include Tags</Label>
                      <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
                        {tags.length > 0 ? (
                          tags.map(tag => (
                            <div key={tag.id} className="flex items-center space-x-2 mb-1">
                              <Checkbox
                                id={`include-${tag.id}`}
                                checked={filters.includeTags.includes(tag.id)}
                                onCheckedChange={() => toggleIncludeTag(tag.id)}
                              />
                              <label htmlFor={`include-${tag.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {tag.icon && <span className="mr-1">{tag.icon}</span>}{tag.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags available</p>
                        )}
                      </div>
                    </div>

                    {/* Exclude Tags */}
                    <div className="space-y-2">
                      <Label>Exclude Tags</Label>
                      <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
                        {tags.length > 0 ? (
                          tags.map(tag => (
                            <div key={tag.id} className="flex items-center space-x-2 mb-1">
                              <Checkbox
                                id={`exclude-${tag.id}`}
                                checked={filters.excludeTags.includes(tag.id)}
                                onCheckedChange={() => toggleExcludeTag(tag.id)}
                              />
                              <label htmlFor={`exclude-${tag.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {tag.icon && <span className="mr-1">{tag.icon}</span>}{tag.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Apply Filters'}
                </Button>
              </div>
            </form>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Results</h3>
                <span className="text-sm text-muted-foreground">Showing {expenses.length} expenses</span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No expenses match your filters.</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your date range or tag selections.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {expenses.map(expense => (
                    <ExpenseBudgetBox
                      key={expense.id}
                      label={expense.title}
                      amount={expense.amount}
                      isIncome={expense.amount > 0}
                      date={expense.date}
                      tags={expense.tags || []}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;