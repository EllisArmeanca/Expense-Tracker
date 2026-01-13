import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { ChevronUp, Home, Settings, FileText, DollarSign, Users, User, Tag } from 'lucide-react';

const NavigationStack = ({ className = "", disableAutoPush = false }) => {
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
    <div className={`flex flex-col items-center ${className}`}>
      {/* Arrow pointing up to indicate it grows upward */}
      <div className="mb-1 flex justify-center">
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Navigation stack */}
      <Card className="flex flex-col items-center p-2 bg-muted">
        {[...navigationStack].reverse().map((item, index) => {
          const IconComponent = item.icon;
          const isCurrent = index === 0; // Last item (current page) is at the bottom of reversed array
          const stackIndex = navigationStack.length - 1 - index; // Original index in non-reversed array

          return (
            <Button
              key={`${item.path}-${item.timestamp}-${index}`}
              variant={isCurrent && !item.isDemo ? "default" : "ghost"}
              size="icon"
              className={`m-1 h-8 w-8 rounded-full ${isCurrent && !item.isDemo ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              onClick={() => handleItemClick(stackIndex)}
              aria-label={`Go to ${item.label}`}
              title={item.label}
            >
              <IconComponent className="h-4 w-4" />
            </Button>
          );
        })}
      </Card>
    </div>
  );
};

export default NavigationStack;