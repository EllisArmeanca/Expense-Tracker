import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const TagPieChart = ({ 
  data = [], 
  width = 400, 
  height = 400, 
  title = "Tags Distribution", 
  showLegend = true,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
}) => {
  // Calculate total amount for percentage calculation
  const totalAmount = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // Prepare data with percentage calculation
  const chartData = data.map(item => ({
    ...item,
    percentage: totalAmount > 0 ? ((Math.abs(item.amount) / totalAmount) * 100).toFixed(1) : 0,
    name: item.name || item.label || item.tagName || 'Unknown'
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative" style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="amount"
              nameKey="name"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            <Tooltip 
              formatter={(value, name, props) => [`$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
              labelFormatter={(label) => `Tag: ${label}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="truncate">{item.name}</span>
            <span className="ml-auto font-medium">${Math.abs(item.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPieChart;