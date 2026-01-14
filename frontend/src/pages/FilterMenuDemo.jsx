import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FilterMenu from '@/components/custom/FilterMenu';

const FilterMenuDemo = () => {
  // Simulate fetching user-created tags from an API
  const fetchUserTags = async () => {
    // This would normally be an API call to get tags from the backend
    // For demo purposes, we'll return some simulated user-created tags
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Groceries' },
          { id: '2', name: 'Dinner with friends' },
          { id: '3', name: 'Gas' },
          { id: '4', name: 'Coffee' },
          { id: '5', name: 'Shopping' },
          { id: '6', name: 'Entertainment' },
          { id: '7', name: 'Travel' },
          { id: '8', name: 'Utilities' },
          { id: '9', name: 'Subscriptions' },
          { id: '10', name: 'Medical' },
        ]);
      }, 500); // Simulate network delay
    });
  };

  const handleFiltersApplied = (filters) => {
    console.log('Filters applied:', filters);
    alert(`Filters applied! Check console for details.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Menu</CardTitle>
        <CardDescription>A drawer-based filter component with various controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center p-8 bg-muted rounded-md">
          <FilterMenu
            title="Expense Filters"
            description="Apply filters to customize your expense view"
            triggerText="Open Filter Menu"
            onApplyFilters={handleFiltersApplied}
            getTags={fetchUserTags}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>• Opens as a drawer from the bottom</p>
          <p>• Contains multiple filter types (amount, date, tags)</p>
          <p>• Includes dynamically loaded user-created tags</p>
          <p>• Includes apply and reset functionality</p>
          <p>• Supports custom filter components via children</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterMenuDemo;