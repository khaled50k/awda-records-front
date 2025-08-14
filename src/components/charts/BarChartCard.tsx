import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

const COLORS = ['#00A86B', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#F59E42', '#F472B6', '#FBBF24'];

interface BarChartCardProps {
  title: string;
  data: Array<any>;
  bars: Array<{ dataKey: string; name: string; color?: string }>;
  xKey: string;
  description?: string;
  height?: number;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({ title, data, bars, xKey, description, height = 250 }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {bars.map((bar, idx) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color || COLORS[idx % COLORS.length]}
                barSize={24}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={bar.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 