import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Components from '@/pages/Components';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NavigationStackProvider } from '@/contexts/NavigationStackContext';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import StackLayout from '@/components/layout/StackLayout';
import NavigationStack from '@/components/custom/NavigationStack';
import { cn } from '@/lib/utils';
import ExpensesPage from '@/pages/Expenses';
import SettingsPage from '@/pages/Settings';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace with a spinner component
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace with a spinner component
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Force authentication redirect for all non-authenticated users
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin protected route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace with a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <NavigationStackProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <ResponsiveLayout>
                        <Dashboard />
                      </ResponsiveLayout>
                    </RequireAuth>
                  } />
                  <Route path="/admin" element={
                    <RequireAuth>
                      <AdminRoute>
                        <ResponsiveLayout>
                          <AdminDashboard />
                        </ResponsiveLayout>
                      </AdminRoute>
                    </RequireAuth>
                  } />
                  <Route path="/components" element={
                    <RequireAuth>
                      <ResponsiveLayout>
                        <StackLayout>
                          <Components />
                        </StackLayout>
                      </ResponsiveLayout>
                    </RequireAuth>
                  } />
                  <Route path="/expenses" element={
                    <RequireAuth>
                      <ResponsiveLayout>
                        <StackLayout>
                          <ExpensesPage />
                        </StackLayout>
                      </ResponsiveLayout>
                    </RequireAuth>
                  } />
                  <Route path="/settings" element={
                    <RequireAuth>
                      <ResponsiveLayout>
                        <StackLayout>
                          <SettingsPage />
                        </StackLayout>
                      </ResponsiveLayout>
                    </RequireAuth>
                  } />
                </Routes>
              </main>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </NavigationStackProvider>
  );
}

export default App;