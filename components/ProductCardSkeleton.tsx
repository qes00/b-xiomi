import React from 'react';

interface ProductCardSkeletonProps {
    count?: number;
}

const SingleSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
        {/* Image placeholder */}
        <div className="aspect-square bg-stone-200" />

        {/* Content placeholder */}
        <div className="p-4 space-y-3">
            {/* Category */}
            <div className="h-3 w-16 bg-stone-200 rounded" />

            {/* Title */}
            <div className="h-5 w-3/4 bg-stone-200 rounded" />

            {/* Description */}
            <div className="space-y-2">
                <div className="h-3 w-full bg-stone-100 rounded" />
                <div className="h-3 w-2/3 bg-stone-100 rounded" />
            </div>

            {/* Price and button */}
            <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-20 bg-stone-200 rounded" />
                <div className="h-10 w-10 bg-gold-100 rounded-full" />
            </div>
        </div>
    </div>
);

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <SingleSkeleton key={index} />
            ))}
        </>
    );
};

// Grid variant for full page loading
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <ProductCardSkeleton count={count} />
    </div>
);

export default ProductCardSkeleton;
