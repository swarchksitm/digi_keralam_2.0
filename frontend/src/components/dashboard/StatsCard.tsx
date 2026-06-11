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
    color?: 'blue' | 'green';
    onClick?: () => void;
    className?: string;
}

const colorMap = {
    blue: 'bg-[#193756] text-white shadow-md shadow-blue-900/10', // Primary Dark Blue (Solid)
    green: 'bg-[#4edb80] text-white shadow-md shadow-green-500/20', // Accent Green (Solid)
    // Legacy mapping
    purple: 'bg-[#193756] text-white',
    orange: 'bg-[#4edb80] text-white',
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    description,
    color = 'blue',
    onClick,
    className
}) => {
    return (
        <Card onClick={onClick} className={clsx(className, onClick && "cursor-pointer hover:shadow-md transition-shadow")}>
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
