import React from 'react';
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  growth?: number;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = '', growth, description }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">{title}</div>
            <div className={`text-xl font-bold ${color} mb-2`}>{value}</div>
            {growth !== undefined && (
              <div className="flex items-center text-xs">
                <span className={growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {growth > 0 ? '+' : ''}{growth}%
                </span>
              </div>
            )}
            {description && <div className="text-xs text-muted-foreground mt-2">{description}</div>}
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/20">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 