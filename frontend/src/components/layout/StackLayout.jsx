import React from 'react';
import { useLocation } from 'react-router-dom';
import NavigationStack from '@/components/custom/NavigationStack';
import { cn } from '@/lib/utils';

const StackLayout = ({ children }) => {
  const location = useLocation();
  
  // Don't show navigation stack on dashboard/home page
  const hideStack = location.pathname === '/' || location.pathname === '/dashboard';
  
  if (hideStack) {
    return <div>{children}</div>;
  }
  
  return (
    <div className="relative min-h-screen">
      {/* Desktop: Horizontal stack at top left */}
      <div className="hidden md:block absolute top-4 left-4 z-10">
        <NavigationStack className="" />
      </div>
      
      {/* Mobile: Stack at bottom right */}
      <div className="md:hidden fixed bottom-20 right-4 z-10">
        <NavigationStack className="" />
      </div>
      
      {/* Main content */}
      <div className="pt-0 md:pt-0">
        {children}
      </div>
    </div>
  );
};

export default StackLayout;