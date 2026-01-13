import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';  
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Groceries', amount: 85.30, category: 'Food', date: '2024-01-10', description: 'Weekly groceries' },
    { id: 2, title: 'Gas', amount: 45.00, category: 'Transport', date: '2024-01-09', description: 'Fill up car tank' },
    { id: 3, title: 'Netflix', amount: 15.99, category: 'Entertainment', date: '2024-01-08', description: 'Monthly subscription' },
  ]);
  
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const monthlyExpenses = expenses.filter(e => e.date.startsWith('2024-01')).reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const categories = [...new Set(expenses.map(e => e.category))];

  const handleAddExpense = (e) => {
    e.preventDefault();
    
    if (!newExpense.title || !newExpense.amount) return;
    
    const expense = {
      id: expenses.length + 1,
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      description: newExpense.description
    };
    
    setExpenses([expense, ...expenses]);
    setNewExpense({
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowAddExpenseDialog(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, <span className="font-semibold">{user?.name || 'User'}!</span></p>
        </div>
        
        <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details for your new expense
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Expense
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Your total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Spending this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${monthlyExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Your spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest expenses</CardDescription>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-muted-foreground">{expense.description}</TableCell>
                  <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {expenses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No expenses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first expense to get started
              </p>
              <Button
                onClick={() => setShowAddExpenseDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;