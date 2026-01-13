import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const ExpenditureIncomeChart = ({ 
  data = [], 
  width = '100%', 
  height = 400, 
  title = "Expenditure vs Income Over Time",
  showGrid = true,
  showLegend = true
}) => {
  // Calculate running balance (income - expenses)
  const processedData = data.map(item => ({
    ...item,
    netFlow: (item.income || 0) - (item.expenditure || 0)
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative" style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            {showLegend && <Legend />}
            <Tooltip 
              formatter={(value, name) => [`$${value}`, name.replace(/([A-Z])/g, ' $1').trim()]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="expenditure"
              name="Expenditure"
              stroke="#ef4444" // red
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981" // green
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="netFlow"
              name="Net Flow (Income - Expense)"
              stroke="#3b82f6" // blue
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenditureIncomeChart;