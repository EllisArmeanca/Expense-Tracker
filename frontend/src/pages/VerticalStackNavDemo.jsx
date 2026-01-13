import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VerticalStackNav from '@/components/custom/VerticalStackNav';

const VerticalStackNavDemo = () => {
  const [demoPath, setDemoPath] = useState('home');

  // Sample stack navigation items
  const stackItems = [
    { 
      icon: 'lucide:home', 
      label: 'Home', 
      to: '/', 
      action: 'navigate'
    },
    { 
      icon: 'lucide:settings', 
      label: 'Settings', 
      to: '/settings',
      action: 'navigate'
    },
    { 
      icon: 'lucide:user', 
      label: 'Profile', 
      to: '/profile',
      action: 'navigate'
    },
    { 
      icon: 'lucide:arrow-left', 
      label: 'Go Back', 
      action: 'back'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vertical Stack Navigation</CardTitle>
        <CardDescription>Mobile-friendly vertical navigation stack</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm mb-2">Current View: <span className="font-medium">{demoPath}</span></p>
            <Button 
              onClick={() => setDemoPath('sample-view-' + Date.now())}
              variant="outline"
            >
              Simulate Navigation
            </Button>
          </div>
          <VerticalStackNav stackItems={stackItems} />
        </div>
        <div className="text-sm text-muted-foreground mt-4">
          <p>• Shows a vertical stack of navigation items</p>
          <p>• Perfect for mobile UI</p>
          <p>• Each item shows tooltip on hover</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalStackNavDemo;