import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import MobileVerticalStackNav from '@/components/custom/MobileVerticalStackNav';
import { Home, Settings, DollarSign, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileLayout = ({ children, className, ...props }) => {
  const { user } = useAuth();

  // Sample stack navigation items for mobile
  const stackItems = [
    {
      icon: 'lucide:home',
      label: 'Home',
      to: '/',
      action: 'navigate'
    },
    {
      icon: 'lucide:dollar-sign',
      label: 'Dashboard',
      to: '/dashboard',
      action: 'navigate'
    },
    {
      icon: 'lucide:file-text',
      label: 'Expenses',
      to: '/expenses',
      action: 'navigate'
    },
    {
      icon: 'lucide:tag',
      label: 'Tags',
      to: '/tags',
      action: 'navigate'
    },
    {
      icon: 'lucide:settings',
      label: 'Settings',
      to: '/settings',
      action: 'navigate'
    }
  ];

  return (
    <div className={cn("flex flex-col min-h-screen", className)} {...props}>
      <main className="flex-1 relative">
        {children}
      </main>
      <div className="fixed bottom-4 right-4 z-50">
        <MobileVerticalStackNav
          stackItems={stackItems}
          sheetTitle="Quick Navigation"
          sheetDescription="Access common pages quickly"
        />
      </div>
    </div>
  );
};

export default MobileLayout;