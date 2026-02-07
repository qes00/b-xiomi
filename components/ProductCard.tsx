import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../constants';
import { getPrimaryImage } from '../utils/imageHelpers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleViewClick = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  const displayImage = getPrimaryImage(product);
  // Get a second image for hover effect (different from primary)
  const hoverImage = product.images?.find(img => img.url !== displayImage)?.url;

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        {!imageLoaded && (
          <div className={styles.skeleton}>
            <div className="animate-shimmer w-full h-full" />
          </div>
        )}
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className={`${styles.image} ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Hover Image (Flip Effect) */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={product.name}
            loading="lazy"
            className={`${styles.image} absolute inset-0 transition-opacity duration-500 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Overlay on Hover */}
        <div className={`${styles.overlay} ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleViewClick}
            className={styles.viewButton}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Ver</span>
          </button>
          {product.isWhatsappOnly ? (
            <a
              href={`https://wa.me/+51900311048?text=${encodeURIComponent(`Hola! Me interesa el producto: ${product.name} (${formatCurrency(product.price)})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
              title="Consultar por WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className={styles.cartButton}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Badges */}
        {product.isWhatsappOnly && (
          <span className={styles.whatsappBadge}>📲 Consultar</span>
        )}
        {product.brand && !product.isWhatsappOnly && (
          <span className={styles.brandBadge}>{product.brand}</span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Variants Preview */}
        {product.colors && product.colors.length > 0 && (
          <div className={styles.variants}>
            <div className={styles.colorDots}>
              {product.colors.slice(0, 4).map((color, idx) => (
                <span
                  key={idx}
                  className={styles.colorDot}
                  title={color}
                  style={{
                    backgroundColor: color.toLowerCase() === 'blanco' ? '#fff' :
                      color.toLowerCase() === 'negro' ? '#1a1a1a' :
                        color.toLowerCase() === 'azul marino' ? '#1e3a5f' :
                          color.toLowerCase() === 'azul' ? '#3b82f6' :
                            color.toLowerCase() === 'rojo' ? '#ef4444' :
                              color.toLowerCase() === 'verde' ? '#22c55e' :
                                color.toLowerCase() === 'marrón' ? '#8b4513' :
                                  color.toLowerCase() === 'beige' ? '#f5f5dc' :
                                    '#cd9f33'
                  }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className={styles.moreColors}>+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatCurrency(product.price)}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: "group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-gold-lg transition-all duration-500 hover:-translate-y-2",

  imageContainer: "relative h-52 md:h-60 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50",
  skeleton: "absolute inset-0 bg-stone-100",
  image: "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",

  overlay: "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center gap-3 pb-6 transition-opacity duration-300",
  viewButton: "flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gold-500 transition-colors",
  cartButton: "flex items-center justify-center w-10 h-10 bg-gold-500 text-black rounded-full hover:bg-gold-400 transition-colors",
  whatsappButton: "flex items-center justify-center w-10 h-10 bg-[#25d366] text-white rounded-full hover:bg-[#128c7e] transition-colors",

  brandBadge: "absolute top-3 left-3 px-3 py-1 bg-black text-gold-500 text-xs font-bold rounded-full",
  whatsappBadge: "absolute top-3 right-3 px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-full",

  content: "p-5",
  category: "text-xs text-stone-400 uppercase tracking-wider font-semibold mb-1",
  name: "font-bold text-black text-lg leading-tight mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors",

  variants: "mb-3",
  colorDots: "flex items-center gap-1.5",
  colorDot: "w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-stone-200",
  moreColors: "text-xs text-stone-400 font-medium ml-1",

  priceRow: "flex items-center justify-between",
  price: "text-xl font-bold text-gold-600",
  rating: "flex items-center"
};