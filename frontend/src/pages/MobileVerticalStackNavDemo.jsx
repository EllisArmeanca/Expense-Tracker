import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileVerticalStackNav from '@/components/custom/MobileVerticalStackNav';

const MobileVerticalStackNavDemo = () => {
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
        <CardTitle>Mobile Vertical Stack Navigation</CardTitle>
        <CardDescription>Sheet-based mobile navigation stack</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-2">Current View: <span className="font-medium">{demoPath}</span></p>
            <Button 
              onClick={() => setDemoPath('mobile-sample-view-' + Date.now())}
              variant="outline"
            >
              Simulate Navigation
            </Button>
          </div>
          <MobileVerticalStackNav 
            stackItems={stackItems} 
            sheetTitle="Quick Navigation"
            sheetDescription="Access common pages quickly"
          />
        </div>
        <div className="text-sm text-muted-foreground mt-4">
          <p>• Opens as a sheet from the right side</p>
          <p>• Perfect for mobile navigation</p>
          <p>• Works as an overlay interface</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileVerticalStackNavDemo;