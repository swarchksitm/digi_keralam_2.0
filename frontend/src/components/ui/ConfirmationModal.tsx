import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary' | 'warning' | 'success';
    isLoading?: boolean;
    singleButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Yes, Delete!',
    cancelLabel = 'No, keep it',
    variant = 'danger',
    isLoading = false,
    singleButton = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center p-4">
                <div className={`p-4 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-50 text-red-600' :
                        variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                            variant === 'success' ? 'bg-green-50 text-green-600' :
                                'bg-blue-50 text-blue-600'
                    }`}>
                    {variant === 'success' ? (
                        <CheckCircle className="h-8 w-8" />
                    ) : (
                        <AlertTriangle className="h-8 w-8" />
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-8 max-w-sm">{message}</p>

                <div className="flex gap-4 w-full justify-center">
                    {!singleButton && (
                        <Button
                            variant="secondary"
                            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        variant={variant === 'danger' ? 'danger' : variant === 'success' ? 'primary' : 'primary'}
                        className={`w-full ${variant === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white' : ''}`}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
