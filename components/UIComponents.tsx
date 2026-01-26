import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'info'
}) => {
    if (!isOpen) return null;

    const icons = {
        danger: (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        ),
        warning: (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        info: (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        )
    };

    const confirmStyles = {
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
        info: 'bg-gold-500 hover:bg-gold-600 text-black'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                {icons[variant]}
                <h3 className="text-xl font-bold text-black text-center mb-2">{title}</h3>
                <p className="text-stone-600 text-center mb-8">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 font-bold rounded-lg transition-colors ${confirmStyles[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
    size = 'md',
    text
}) => {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-20 h-20 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizes[size]} border-gold-500 border-t-transparent rounded-full animate-spin`} />
            {text && <p className="text-stone-600 font-medium">{text}</p>}
        </div>
    );
};

// Loading Overlay Component
export const LoadingOverlay: React.FC<{ isVisible: boolean; text?: string }> = ({
    isVisible,
    text = 'Cargando...'
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
};

// Skeleton Loader Component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`bg-stone-200 rounded animate-pulse ${className}`} />
    );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
            <Skeleton className="h-52 md:h-60 w-full" />
            <div className="p-5 space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-24" />
            </div>
        </div>
    );
};
