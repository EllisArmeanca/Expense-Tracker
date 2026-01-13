import React from 'react';
import { cn } from '@/lib/utils';
import HorizontalNavigationStack from '@/components/custom/HorizontalNavigationStack';

const DesktopLayout = ({ children, className, ...props }) => {
  return (
    <div className={cn("flex flex-col min-h-screen", className)} {...props}>
      <div className="px-4 pt-2">
        <HorizontalNavigationStack className="mb-4" />
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DesktopLayout;