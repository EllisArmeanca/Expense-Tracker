import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ExpenseBudgetBox from '@/components/custom/ExpenseBudgetBox';

const ExpenseBudgetBoxDemo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense/Budget Box</CardTitle>
        <CardDescription>Shows monetary values with color and trend indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Examples:</h4>
            <ExpenseBudgetBox
              label="Salary Deposit"
              amount={2500}
              isIncome={true}
              date="2023-05-15"
              tags={[{name: 'Income'}]}
            />
            <ExpenseBudgetBox
              label="Grocery Shopping"
              amount={85.30}
              isIncome={false}
              date="2023-05-16"
              tags={[{name: 'Food'}, {name: 'Essential'}]}
            />
            <ExpenseBudgetBox
              label="Freelance Payment"
              amount={500}
              isIncome={true}
              date="2023-05-17"
              tags={[{name: 'Work'}, {name: 'Income'}]}
            />
            <ExpenseBudgetBox
              label="Electricity Bill"
              amount={120.50}
              isIncome={false}
              date="2023-05-18"
              tags={[{name: 'Utilities'}, {name: 'Bills'}]}
            />
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Color Guide:</h4>
            <div className="space-y-2 p-3 bg-muted rounded-md">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Green = Positive Amount (Income)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm">Red = Negative Amount (Expense)</span>
              </div>
              <div className="pt-2 border-t border-muted-foreground/30">
                <p className="text-sm mt-2"><strong>TrendingUp Icon</strong>: Indicates income/increase</p>
                <p className="text-sm"><strong>TrendingDown Icon</strong>: Indicates expense/decrease</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          The Expense/Budget Box component displays financial transactions with appropriate color coding and trend indicators.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpenseBudgetBoxDemo;