import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TagPieChart from '@/components/custom/TagPieChart';

const TagPieChartDemo = () => {
  // Simulated tag data with amounts
  const tagData = [
    { name: 'Groceries', amount: 420.50, icon: '🛒' },
    { name: 'Dinner Out', amount: 180.25, icon: '🍽️' },
    { name: 'Gas', amount: 120.00, icon: '⛽' },
    { name: 'Shopping', amount: 295.75, icon: '🛍️' },
    { name: 'Entertainment', amount: 85.30, icon: '🎬' },
    { name: 'Utilities', amount: 320.00, icon: '💡' },
    { name: 'Subscriptions', amount: 65.40, icon: '📱' },
    { name: 'Medical', amount: 150.25, icon: '🏥' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tag Pie Chart</CardTitle>
        <CardDescription>Visualizes expense distribution across different tags</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <TagPieChart 
            data={tagData}
            title="Expense Distribution by Tag"
          />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Shows proportional distribution of expenses by tag</p>
          <p>• Interactive tooltips with detailed information</p>
          <p>• Legend with color-coded tags and amounts</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagPieChartDemo;