import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExpenseBudgetBox = ({
  label = "Transaction",
  amount = 0,
  isIncome = false,
  currency = "USD",
  date,
  category
}) => {
  // Determine if the transaction should display as positive or negative
  // If isIncome is true, it's always positive (green)
  // If isIncome is false, it's always negative (red), regardless of amount value
  const isPositive = isIncome;

  // Format the absolute value
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <Card className={cn(
      "w-full transition-all duration-200 hover:shadow-md",
      isPositive
        ? "border-green-200 bg-green-50/30 dark:bg-green-950/20"
        : "border-red-200 bg-red-50/30 dark:bg-red-950/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className={cn(
            "flex items-center justify-center rounded-full p-1",
            isPositive
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {date && (
          <p className="text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {isPositive ? '+' : '-'}${formattedAmount}
        </div>
        {category && (
          <p className="text-xs text-muted-foreground mt-1">
            {category}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseBudgetBox;