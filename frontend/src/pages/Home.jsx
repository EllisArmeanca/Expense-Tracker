import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Expense Tracker</CardTitle>
          <CardDescription>Manage your expenses efficiently</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;