import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HorizontalNavigationStack from '@/components/custom/HorizontalNavigationStack';
import { Home, Settings, FileText, DollarSign, Tag, Users, Briefcase, Car, Heart, ShoppingCart } from 'lucide-react';
import { useNavigationStack } from '@/contexts/NavigationStackContext';

const HorizontalNavigationStackDemo = () => {
  const { addToStack } = useNavigationStack();
  const [customLabel, setCustomLabel] = useState('Custom Page');
  const [selectedIcon, setSelectedIcon] = useState('home');
  
  const iconMap = {
    home: { component: Home, label: 'Home' },
    settings: { component: Settings, label: 'Settings' },
    dollar: { component: DollarSign, label: 'Finance' },
    file: { component: FileText, label: 'Document' },
    tag: { component: Tag, label: 'Tag' },
    users: { component: Users, label: 'Users' },
    briefcase: { component: Briefcase, label: 'Work' },
    car: { component: Car, label: 'Car' },
    heart: { component: Heart, label: 'Favorites' },
    shopping: { component: ShoppingCart, label: 'Shop' },
  };
  
  const handleAddToStack = () => {
    const selectedIconData = iconMap[selectedIcon];
    const pageInfo = {
      path: `/${customLabel.toLowerCase().replace(/\s+/g, '-')}`,
      icon: selectedIconData.component,
      label: customLabel || selectedIconData.label,
      timestamp: Date.now()
    };
    addToStack(pageInfo, true); // Pass true for isDemo
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horizontal Navigation Stack</CardTitle>
        <CardDescription>Top-left navigation stack for desktop (horizontal layout)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customLabel">Page Label</Label>
              <Input 
                id="customLabel" 
                value={customLabel} 
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Enter page name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iconSelect">Select Icon</Label>
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                <SelectTrigger id="iconSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(iconMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <value.component className="h-4 w-4 mr-2" />
                        {value.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleAddToStack} className="w-full">
              Add to Stack
            </Button>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Quick Add</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setSelectedIcon('home');
                    setCustomLabel('Home');
                    handleAddToStack();
                  }}
                >
                  <Home className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setSelectedIcon('dollar');
                    setCustomLabel('Expenses');
                    handleAddToStack();
                  }}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setSelectedIcon('tag');
                    setCustomLabel('Tags');
                    handleAddToStack();
                  }}
                >
                  <Tag className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setSelectedIcon('settings');
                    setCustomLabel('Settings');
                    handleAddToStack();
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="w-full bg-muted/50 p-4 rounded-lg">
              <HorizontalNavigationStack disableAutoPush={true} />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              This is the horizontal navigation stack. Designed for placement in the top-left corner on desktop.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-4">
          <p>• Horizontal layout for desktop top navigation</p>
          <p>• Shows navigation history from left to right</p>
          <p>• Each icon represents a page in your navigation history</p>
          <p>• Click any icon to navigate back to that page</p>
          <p>• Limited to 5 most recent pages</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HorizontalNavigationStackDemo;