import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl'
    }[size];

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div
                ref={overlayRef}
                className="fixed inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className={`relative w-full ${maxWidthClass} max-h-[90vh] flex flex-col transform rounded-2xl bg-white p-6 text-left shadow-apple transition-all animate-in fade-in zoom-in-95 duration-200`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900 leading-none tracking-tight">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="mt-2 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
