import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text = 'Cargando...'
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div
                className={`${sizeClasses[size]} border-gold-200 border-t-gold-500 rounded-full animate-spin`}
                role="status"
                aria-label={text}
            />
            {text && (
                <p className="text-stone-500 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

// Full page loading variant
export const PageLoader: React.FC<{ text?: string }> = ({ text }) => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
    </div>
);

export default LoadingSpinner;
