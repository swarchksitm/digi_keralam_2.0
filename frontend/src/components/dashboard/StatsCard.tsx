import React from 'react';
import { Card, CardContent } from '../ui/Card';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    description,
    color = 'blue'
}) => {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {description && (
                        <p className="text-xs text-gray-400 mt-2">{description}</p>
                    )}
                </div>
                <div className={clsx("p-3 rounded-full", colorMap[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
};
