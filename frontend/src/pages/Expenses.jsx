import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, Search, Download, Filter } from 'lucide-react';
import ExpenseForm from '@/components/ExpenseForm';
import { useAuth } from '@/contexts/AuthContext';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Groceries', amount: 85.30, category: 'Food', date: '2024-01-10', description: 'Weekly groceries' },
    { id: 2, title: 'Gas', amount: 45.00, category: 'Transport', date: '2024-01-09', description: 'Fill up car tank' },
    { id: 3, title: 'Netflix', amount: 15.99, category: 'Entertainment', date: '2024-01-08', description: 'Monthly subscription' },
    { id: 4, title: 'Gym Membership', amount: 39.99, category: 'Health', date: '2024-01-05', description: 'Monthly membership' },
    { id: 5, title: 'Electricity Bill', amount: 120.50, category: 'Utilities', date: '2024-01-01', description: 'Monthly electricity bill' },
  ]);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const categories = ['All', ...new Set(expenses.map(e => e.category))];

  const handleAddExpense = (expenseData) => {
    const newExpense = {
      id: expenses.length + 1,
      ...expenseData
    };
    setExpenses([newExpense, ...expenses]);
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-muted-foreground">Track and manage all your expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Total spending overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setShowExpenseForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>View and manage your expenses</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{expense.description}</TableCell>
                    <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No expenses found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || filterCategory !== 'All' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'Add your first expense to get started'}
                      </p>
                      {!searchTerm && filterCategory === 'All' && (
                        <Button onClick={() => setShowExpenseForm(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Expense
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ExpenseForm 
        isOpen={showExpenseForm} 
        onClose={() => setShowExpenseForm(false)} 
        onSubmit={handleAddExpense} 
      />
    </div>
  );
};

export default Expenses;