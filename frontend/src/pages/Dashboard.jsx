import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart,
  Wallet,
  Tag,
  User,
  DollarSign,
  Plus
} from 'lucide-react';
import ExpenditureIncomeChart from '@/components/custom/ExpenditureIncomeChart';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0, goalProgress: 0 });
  const [trendData, setTrendData] = useState({ status: 'on-track', percentage: 0 });
  const [budgetWarning, setBudgetWarning] = useState({ status: 'safe', amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.slice(0, 2);
  };

  // Fetch financial data from existing backend APIs
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Get all financial transactions (using the actual backend schema)
      const transactionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query GetExpenses {
              expenses {
                id
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
          `
        })
      });

      const transactionsResult = await transactionsResponse.json();

      if (transactionsResult.errors) {
        throw new Error(transactionsResult.errors[0]?.message || 'Error fetching transactions');
      }

      // Handle response - might be direct array or connection style
      let allTransactions = [];
      if (transactionsResult.data && transactionsResult.data.expenses) {
        // Check if it's in connection format or direct array
        if (Array.isArray(transactionsResult.data.expenses)) {
          allTransactions = transactionsResult.data.expenses;
        } else if (transactionsResult.data.expenses.edges) {
          // Connection format
          allTransactions = transactionsResult.data.expenses.edges.map(edge => edge.node);
        } else {
          // If it's an object with other properties
          allTransactions = transactionsResult.data.expenses;
        }
      }

      // Separate into incomes and expenses based on amount
      const incomes = allTransactions.filter(t => t.amount >= 0);
      const expenses = allTransactions.filter(t => t.amount < 0);

      // Calculate aggregated data with NaN protection
      const totalExpenses = expenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount);
        return isNaN(amount) ? sum : sum + Math.abs(amount);
      }, 0);
      const totalIncome = incomes.reduce((sum, income) => {
        const amount = parseFloat(income.amount);
        return isNaN(amount) ? sum : sum + amount;
      }, 0);
      const netSavings = totalIncome - totalExpenses;

      // Group data by month/week for the chart
      const monthlyData = groupByMonthYear(allTransactions);

      // Calculate trend based on comparison with previous period
      const trend = calculateTrend(incomes, expenses);

      // Calculate budget warning based on some criteria
      const budget = calculateBudgetWarning(totalIncome, totalExpenses);

      setFinancialData(monthlyData);
      setSummary({
        income: totalIncome,
        expenses: totalExpenses,
        savings: netSavings,
        goalProgress: calculateGoalProgress(totalIncome, totalExpenses) // Assuming 80% of income saved as goal
      });
      setTrendData(trend);
      setBudgetWarning(budget);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
      // Fallback to mock data if API call fails
      setFinancialData([
        { date: 'Week 1', income: 5000, expenditure: 3000 },
        { date: 'Week 2', income: 5200, expenditure: 2800 },
        { date: 'Week 3', income: 4800, expenditure: 3200 },
        { date: 'Week 4', income: 5300, expenditure: 3100 },
      ]);
      setSummary({
        income: 20300,
        expenses: 12100,
        savings: 8200,
        goalProgress: 78
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to group expenses/incomes by month/year
  const groupByMonthYear = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [
        { date: 'Week 1', income: 0, expenditure: 0 },
        { date: 'Week 2', income: 0, expenditure: 0 },
        { date: 'Week 3', income: 0, expenditure: 0 },
        { date: 'Week 4', income: 0, expenditure: 0 },
      ];
    }

    // Group by month and separate incomes and expenses
    const grouped = {};

    transactions.forEach(transaction => {
      // Validate that amount is a valid number
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount)) {
        console.warn('Invalid amount found', transaction);
        return; // Skip invalid transactions
      }

      const date = new Date(transaction.date);
      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found', transaction);
        return; // Skip invalid transactions
      }

      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = { income: 0, expenditure: 0 };
      }

      // Determine if it's income or expense
      if (amount > 0) {
        // For this example, assuming positive amounts are incomes
        grouped[monthKey].income += Math.abs(amount);
      } else {
        // Negative amounts or categorized as expenses
        grouped[monthKey].expenditure += Math.abs(amount);
      }
    });

    // Convert to the format expected by the chart
    let result = Object.entries(grouped)
      .map(([date, values]) => ({
        date,
        income: values.income || 0,
        expenditure: values.expenditure || 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-4); // Get last 4 months

    // If no data was grouped, provide default data for the chart
    if (result.length === 0) {
      const now = new Date();
      const lastMonths = [];
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        lastMonths.push({
          date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
          income: 0,
          expenditure: 0
        });
      }
      result = lastMonths;
    }

    return result;
  };

  // Helper function to calculate trend
  const calculateTrend = (incomes, expenses) => {
    if (incomes.length === 0 && expenses.length === 0) {
      return { status: 'on-track', percentage: 0 };
    }

    // Calculate averages for current vs previous periods
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthExpenses = expenses.filter(e =>
      new Date(e.date).getMonth() === currentMonth.getMonth() &&
      new Date(e.date).getFullYear() === currentMonth.getFullYear()
    );
    const lastMonthExpenses = expenses.filter(e =>
      new Date(e.date).getMonth() === lastMonth.getMonth() &&
      new Date(e.date).getFullYear() === lastMonth.getFullYear()
    );

    const currentMonthExpTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthExpTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (lastMonthExpTotal === 0) {
      return { status: 'on-track', percentage: 0 };
    }

    const percentageChange = (lastMonthExpTotal !== 0) ?
      ((currentMonthExpTotal - lastMonthExpTotal) / lastMonthExpTotal) * 100 : 0;
    
    return {
      status: percentageChange > 5 ? 'negative' : percentageChange < -5 ? 'positive' : 'on-track',
      percentage: Math.round(percentageChange)
    };
  };

  // Helper function to calculate budget warning
  const calculateBudgetWarning = (totalIncome, totalExpenses) => {
    // Simple logic: if expenses are more than 90% of income, show warning
    const ratio = totalExpenses / totalIncome;
    
    if (isNaN(ratio) || totalIncome === 0) {
      return { status: 'safe', amount: 0 };
    }

    if (ratio > 0.9) {
      return { 
        status: 'warning', 
        amount: Math.max(0, totalExpenses - (totalIncome * 0.9)) 
      };
    }

    return { status: 'safe', amount: 0 };
  };

  // Helper function to calculate goal progress
  const calculateGoalProgress = (income, expenses) => {
    // Example: goal is to save 20% of income
    if (income <= 0) return 0;
    
    const targetSaving = income * 0.2;
    const actualSaving = income - expenses;
    
    return Math.min(100, Math.round((actualSaving / targetSaving) * 100));
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Desktop sidebar navigation
  const DesktopNav = () => (
    <div className="flex flex-col items-end space-y-4 p-4 h-full min-h-screen bg-muted border-l">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
        <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
      </Avatar>
      
      <Separator orientation="horizontal" className="w-8" />
      
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => navigate('/add-expense')}
        aria-label="Add Transaction"
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => navigate('/')}
        aria-label="Dashboard"
      >
        <Home className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full hover:bg-accent"
        onClick={() => navigate('/categories')}
        aria-label="Categories"
      >
        {/* Circle and triangle icon combination */}
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full mr-1 bg-blue-500"></div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[10px] border-b-blue-500 border-r-[6px] border-r-transparent"></div>
        </div>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full hover:bg-accent"
        onClick={() => navigate('/statistics')}
        aria-label="Statistics"
      >
        <BarChart className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full hover:bg-accent"
        onClick={() => navigate('/settings')}
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );

  // Mobile bottom navigation
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-14 w-14 p-0"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-14 w-14 p-0"
          onClick={() => navigate('/profile')}
          aria-label="Account"
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Account</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-14 w-14 p-0"
          onClick={() => navigate('/statistics')}
          aria-label="Stats"
        >
          <Activity className="h-5 w-5" />
          <span className="text-xs mt-1">Stats</span>
        </Button>
        
        {/* Current page - highlighted and not clickable */}
        <div className="flex flex-col items-center justify-center h-14 w-14">
          <div className="bg-primary rounded-full p-2">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1 text-primary">Home</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-14 w-14 p-0"
          onClick={() => navigate('/wallet')}
          aria-label="Balance"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Balance</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-14 w-14 p-0"
          onClick={() => navigate('/categories')}
          aria-label="Categories"
        >
          <Tag className="h-5 w-5" />
          <span className="text-xs mt-1">Categories</span>
        </Button>
      </div>
      
      {/* Floating Add button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full shadow-lg"
        onClick={() => navigate('/add-expense')}
        aria-label="Add Transaction"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );

  // Trend Widget Component
  const TrendWidget = () => {
    if (loading) return <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />;
    
    return (
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {trendData.status === 'positive' ? (
              <TrendingDown className="h-6 w-6 text-green-500" />
            ) : trendData.status === 'negative' ? (
              <TrendingUp className="h-6 w-6 text-red-500" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-0.5 bg-gray-400"></div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {trendData.status === 'positive' 
                  ? 'Spending Less' 
                  : trendData.status === 'negative' 
                    ? 'Spending More' 
                    : 'On Track'}
              </p>
              {trendData.percentage !== 0 && (
                <p className={`text-xs ${
                  trendData.status === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trendData.status === 'positive' ? '-' : '+'}{Math.abs(trendData.percentage)}% 
                  {' '}vs last month
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Budget Warning Widget
  const BudgetWarningWidget = () => {
    if (loading) return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {budgetWarning.status === 'warning' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Over Budget Risk</span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Within Budget</span>
                </>
              )}
            </div>
            {budgetWarning.status === 'warning' && (
              <p className="text-xs text-red-500">
                May exceed by ${budgetWarning.amount.toFixed(2)}
              </p>
            )}
            <Badge variant="outline" className="mt-2">
              Monthly limit: $5000
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && financialData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 m-4">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">Failed to load dashboard data: {error}</p>
            <Button onClick={fetchFinancialData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && financialData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 m-4">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">Failed to load dashboard data: {error}</p>
            <Button onClick={fetchFinancialData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.income.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                    <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.expenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-muted-foreground">
                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a1.559 1.559 0 01-.921.421zM10.5 13.5a.75.75 0 01.75.75c0 .605-.25 1.153-.664 1.569a.75.75 0 11-1.049-1.083A2.237 2.237 0 0010.5 14.25zM12.75 9a.75.75 0 00-.75.75c0 .364.148.686.448.99.212.216.333.52.333.847 0 .327-.121.631-.333.847a.75.75 0 101.081 1.02A2.245 2.245 0 0013.5 12a2.245 2.245 0 00-.75-1.673z" />
                  <path fillRule="evenodd" d="M7.5 1.5a.75.75 0 00-1.372.38l-.31 1.034a.75.75 0 00.82.89l.886-.305c.25-.085.49-.18.723-.284a.75.75 0 00-.524-1.405zM1.5 7.5a.75.75 0 00-.524 1.405c.233.104.473.199.723.284l.886.305a.75.75 0 00.82-.89l-.31-1.034A.75.75 0 001.5 7.5zm15.723.284a.75.75 0 00.82-.89l-.31-1.034a.75.75 0 00-1.372.38l-.31 1.034a.75.75 0 00.82.89l.886-.305c.25-.085.49-.18.723-.284zm-15.723 4.5a.75.75 0 00-.524 1.405c.233.104.473.199.723.284l.886.305a.75.75 0 00.82-.89l-.31-1.034a.75.75 0 00-1.03.38zm17.446-4.5a.75.75 0 00-1.03-.38l-.31 1.034a.75.75 0 00.82.89l.886-.305c.25-.085.49-.18.723-.284a.75.75 0 00-.524-1.405zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM12 17.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.savings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-muted-foreground">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.goalProgress}%</div>
                <p className="text-xs text-muted-foreground">of target achieved</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Financial Flow Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Monthly Financial Flow</CardTitle>
              <CardDescription>Tracks expenditures, income, and net flow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenditureIncomeChart 
                data={financialData}
                height={300}
                title="Monthly Financial Flow"
              />
            </CardContent>
          </Card>

          {/* Trend and Budget Widgets */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <TrendWidget />
            <BudgetWarningWidget />
            
            {/* Additional widget placeholder */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">No recent transactions</div>
                  <div className="text-xs text-muted-foreground">Last transaction: 2 days ago</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Navigation Sidebar */}
        <DesktopNav />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Header - User Info */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="p-4 pb-20"> {/* Added pb-20 to account for mobile nav height */}
          <div className="grid gap-4 grid-cols-2 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">${summary.income.toLocaleString()}</div>
                <p className="text-xs text-green-500">+20.1%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">${summary.expenses.toLocaleString()}</div>
                <p className="text-xs text-red-500">+12.5%</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Financial Flow Chart - Mobile */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Monthly Financial Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenditureIncomeChart 
                data={financialData}
                height={200}
                title=""
              />
            </CardContent>
          </Card>

          {/* Mobile Widgets */}
          <div className="space-y-4">
            <TrendWidget />
            <BudgetWarningWidget />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default Dashboard;