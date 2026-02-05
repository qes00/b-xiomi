import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../constants';
import { Button } from './Button';
import { getAllImages, getPrimaryImageForColor, hasMultipleImages, getDisplayImages } from '../utils/imageHelpers';

interface ProductViewerProps {
    product: Product | null;
    products?: Product[];
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
    onSwitchProduct?: (product: Product) => void;
}

export const ProductViewer: React.FC<ProductViewerProps> = ({ product, products = [], isOpen, onClose, onAddToCart, onSwitchProduct }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Get display images based on selected color
    const displayImages = useMemo(() => 
        getDisplayImages(product || {} as Product, selectedColor),
        [product, selectedColor]
    );

    // Reset selections when product changes
    useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes?.[0] || '');
            // Check if product has colors, if so select first
            const firstColor = product.colors?.[0] || '';
            setSelectedColor(firstColor);
            setQuantity(1);
            setSelectedImageIndex(0);
        }
    }, [product]);

    // Reset image index when filtered images change
    useEffect(() => {
        setSelectedImageIndex(0);
    }, [displayImages]);

    // Calculate related products
    const relatedProducts = React.useMemo(() => {
        if (!product || !products.length) return [];
        return products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
    }, [product, products]);

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        onClose();
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className={styles.closeButton}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div className={styles.content}>
                    <div className={styles.imageSection}>
                        {/* Main Image */}
                        <img 
                            src={displayImages[selectedImageIndex] || product.imageUrl} 
                            alt={product.name} 
                            className={styles.image} 
                        />
                        
                        {/* Image Thumbnails */}
                        {(hasMultipleImages(product) || displayImages.length > 1) && (
                            <div className={styles.thumbnails.container}>
                                {displayImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`${styles.thumbnails.item} ${idx === selectedImageIndex ? styles.thumbnails.active : ''}`}
                                    >
                                        <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className={styles.categoryBadge}>{product.category}</div>
                    </div>

                    <div className={styles.details}>
                        <h2 className={styles.title}>{product.name}</h2>
                        {product.brand && (
                            <p className="text-sm text-stone-600 font-medium">Marca: <strong>{product.brand}</strong></p>
                        )}
                        <p className={styles.price}>{formatCurrency(product.price)}</p>
                        <p className={styles.description}>{product.description}</p>

                        {/* Variant Selectors */}
                        {(product.sizes || product.colors) && (
                            <div className={styles.variants}>
                                {product.sizes && product.sizes.length > 0 && (
                                    <div>
                                        <label className={styles.variantLabel}>Talla:</label>
                                        <div className={styles.variantOptions}>
                                            {product.sizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`${styles.variantButton} ${selectedSize === size ? styles.variantButtonActive : ''}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <label className={styles.variantLabel}>Color:</label>
                                        <div className={styles.variantOptions}>
                                            {product.colors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`${styles.variantButton} ${selectedColor === color ? styles.variantButtonActive : ''}`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.features}>
                            <h3 className={styles.featuresTitle}>Características</h3>
                            <ul className={styles.featuresList}>
                                <li>✓ Producto 100% peruano</li>
                                <li>✓ Envío a todo el país</li>
                                <li>✓ Garantía de calidad</li>
                                <li>✓ Atención personalizada</li>
                            </ul>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantitySelector}>
                                <button onClick={decrementQuantity} className={styles.quantityButton}>-</button>
                                <span className={styles.quantityDisplay}>{quantity}</span>
                                <button onClick={incrementQuantity} className={styles.quantityButton}>+</button>
                            </div>
                            <Button onClick={handleAddToCart} className="flex-1">
                                Agregar al Carrito
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className={styles.related.container}>
                        <h3 className={styles.related.title}>También te podría interesar</h3>
                        <div className={styles.related.grid}>
                            {relatedProducts.map(related => (
                                <div 
                                    key={related.id} 
                                    className={styles.related.card}
                                    onClick={() => onSwitchProduct && onSwitchProduct(related)}
                                >
                                    <div className="h-32 w-full bg-stone-100 overflow-hidden rounded-lg mb-2">
                                         <img src={related.imageUrl} alt={related.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="text-sm font-bold text-[#0f1c29] truncate">{related.name}</div>
                                    <div className="text-xs text-gold-600 font-bold">{formatCurrency(related.price)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in",
    modal: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up relative",
    closeButton: "absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all hover:scale-110",
    content: "grid md:grid-cols-2 gap-8 p-8",
    imageSection: "relative",
    image: "w-full h-96 object-cover rounded-xl shadow-md",
    thumbnails: {
        container: "flex gap-2 mt-4 overflow-x-auto pb-2",
        item: "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-stone-200 cursor-pointer hover:border-gold-500 transition-colors",
        active: "!border-gold-600 ring-2 ring-gold-500"
    },
    categoryBadge: "absolute top-4 left-4 bg-black text-gold-500 px-4 py-2 rounded-lg text-sm font-bold shadow-lg",
    details: "flex flex-col gap-4",
    title: "text-3xl font-bold text-black",
    price: "text-2xl font-bold text-gold-700",
    description: "text-stone-700 leading-relaxed",
    variants: "space-y-4 border-y border-stone-200 py-4",
    variantLabel: "block text-sm font-bold text-stone-900 mb-2",
    variantOptions: "flex flex-wrap gap-2",
    variantButton: "px-4 py-2 border-2 border-stone-300 rounded-lg font-medium text-stone-800 hover:border-gold-500 transition-colors",
    variantButtonActive: "!border-gold-600 !bg-gold-50 !text-black font-bold",
    features: "bg-white rounded-lg p-6",
    featuresTitle: "font-bold text-black mb-3",
    featuresList: "space-y-2 text-stone-800 text-sm",
    actions: "flex gap-4 items-center pt-6 border-t border-stone-200",
    quantitySelector: "flex items-center border-2 border-stone-300 rounded-lg overflow-hidden",
    quantityButton: "px-4 py-2 bg-stone-100 hover:bg-stone-200 text-black font-bold transition-colors",
    quantityDisplay: "px-6 py-2 font-bold text-black min-w-[3rem] text-center",
    
    related: {
        container: "p-8 border-t border-stone-100 bg-stone-50 rounded-b-2xl",
        title: "text-lg font-bold text-[#0f1c29] mb-4 font-serif",
        grid: "grid grid-cols-2 md:grid-cols-4 gap-4",
        card: "group cursor-pointer bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    }
};
