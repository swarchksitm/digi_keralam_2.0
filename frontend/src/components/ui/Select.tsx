
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    error?: string;
    options: SelectOption[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className,
    disabled = false,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors",
                    error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
                    disabled ? "cursor-not-allowed opacity-50 bg-gray-50" : "cursor-pointer hover:border-gray-400",
                    className
                )}
            >
                <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu - Forced DOWNWARD */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1">
                        {options.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400 text-center">No options available</li>
                        ) : (
                            options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors",
                                        String(value) === String(option.value)
                                            ? "bg-primary-50 text-primary-900 font-medium"
                                            : "text-gray-900 hover:bg-gray-100"
                                    )}
                                >
                                    <span className="flex-1 truncate">{option.label}</span>
                                    {String(value) === String(option.value) && (
                                        <Check className="h-3.5 w-3.5 text-primary-600" />
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};
