import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenditureIncomeChart from '@/components/custom/ExpenditureIncomeChart';

const ExpenditureIncomeChartDemo = () => {
  // Simulated data for a month
  const chartData = [
    { date: 'Jan 1', expenditure: 50, income: 0 },
    { date: 'Jan 5', expenditure: 80, income: 0 },
    { date: 'Jan 10', expenditure: 30, income: 2500 },
    { date: 'Jan 12', expenditure: 120, income: 0 },
    { date: 'Jan 15', expenditure: 45, income: 0 },
    { date: 'Jan 18', expenditure: 200, income: 0 },
    { date: 'Jan 20', expenditure: 0, income: 500 },
    { date: 'Jan 22', expenditure: 90, income: 0 },
    { date: 'Jan 25', expenditure: 60, income: 0 },
    { date: 'Jan 28', expenditure: 150, income: 0 },
    { date: 'Jan 30', expenditure: 75, income: 2600 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenditure vs Income Chart</CardTitle>
        <CardDescription>Tracks expenditures, income, and net flow over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ExpenditureIncomeChart 
            data={chartData}
            title="Monthly Financial Flow"
          />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Orange line shows daily expenditures</p>
          <p>• Green line shows daily income</p>
          <p>• Blue dashed line shows net flow (income - expenditure)</p>
          <p>• Interactive tooltips with detailed information</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenditureIncomeChartDemo;