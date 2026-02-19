import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SelectOption {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
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

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
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
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(lowerTerm));
    }, [options, searchTerm]);

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm(''); // Reset search on select
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-colors relative",
                    error ? "border-red-500 focus-within:ring-red-500" : "border-gray-300",
                    !disabled && "focus-within:ring-2 focus-within:ring-primary-500 hover:border-gray-400",
                    disabled ? "cursor-not-allowed opacity-50 bg-gray-50" : "cursor-pointer",
                    className
                )}
            >
                {isOpen ? (
                    <div className="flex items-center flex-1 min-w-0">
                        <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border-none p-0 focus:ring-0 text-sm bg-transparent placeholder-gray-400"
                            placeholder="Type to search..."
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                ) : (
                    <span className={cn("block truncate flex-1", !selectedOption && "text-gray-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                )}

                <div className="flex items-center ml-2 space-x-1">
                    {selectedOption && !disabled && !isOpen && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400 text-center">No options found</li>
                        ) : (
                            filteredOptions.map((option) => (
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
                                        <Check className="h-3.5 w-3.5 text-primary-600 flex-shrink-0 ml-2" />
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
