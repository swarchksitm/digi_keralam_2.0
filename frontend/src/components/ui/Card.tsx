import React, { type HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("rounded-lg border bg-white text-gray-950 shadow-sm", className)} {...props} />
);

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("p-6 pt-0", className)} {...props} />
);
