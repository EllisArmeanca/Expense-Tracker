import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { ChevronLeft, Home, Settings, FileText, DollarSign, Users, User, Tag } from 'lucide-react';

const HorizontalNavigationStack = ({ className = "", disableAutoPush = false }) => {
  const { navigationStack, addToStack, navigateToIndex } = useNavigationStack();
  const location = useLocation();
  const navigate = useNavigate();

  // Map paths to icons and labels
  const getPathInfo = (path) => {
    const pathMap = {
      '/': { icon: Home, label: 'Home' },
      '/dashboard': { icon: DollarSign, label: 'Dashboard' },
      '/expenses': { icon: FileText, label: 'Expenses' },
      '/settings': { icon: Settings, label: 'Settings' },
      '/profile': { icon: User, label: 'Profile' },
      '/admin': { icon: Users, label: 'Admin' },
      '/components': { icon: Settings, label: 'Components' },
      '/tags': { icon: Tag, label: 'Tags' },
    };
    
    return pathMap[path] || { icon: FileText, label: path.split('/').pop() || 'Page' };
  };

  // Add current location to stack when it changes (unless disabled for demo)
  useEffect(() => {
    if (!disableAutoPush) {
      const pageInfo = {
        path: location.pathname,
        ...getPathInfo(location.pathname),
        timestamp: Date.now()
      };
      addToStack(pageInfo);
    }
  }, [location.pathname, addToStack, disableAutoPush]);

  const handleItemClick = (index) => {
    navigateToIndex(navigate, index);
  };

  if (navigationStack.length <= 1) {
    return null; // Don't show if there's only one item in the stack
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Navigation stack - horizontal layout */}
      <Card className="flex items-center p-1 bg-muted">
        {navigationStack.map((item, index) => {
          const IconComponent = item.icon;
          const isCurrent = index === navigationStack.length - 1; // Last item is current page
          
          return (
            <React.Fragment key={`${item.path}-${item.timestamp}-${index}`}>
              {index > 0 && (
                <ChevronLeft className="h-4 w-4 mx-1 text-muted-foreground rotate-180" />
              )}
              <Button
                variant={isCurrent && !item.isDemo ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 rounded-full mx-1 ${isCurrent && !item.isDemo ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                onClick={() => handleItemClick(index)}
                aria-label={`Go to ${item.label}`}
                title={item.label}
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            </React.Fragment>
          );
        })}
      </Card>
    </div>
  );
};

export default HorizontalNavigationStack;