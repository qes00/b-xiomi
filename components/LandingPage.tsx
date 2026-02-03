import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { formatCurrency } from '../constants';
import { getFeaturedProducts } from '../services/productService';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductViewer } from './ProductViewer';
import { useCartStore } from '../stores/cartStore';

const CarouselSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1074&auto=format&fit=crop",
      title: "Colección Mágica",
      subtitle: "Vestidos que cuentan historias",
      link: "/shop?category=Gala"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1035&auto=format&fit=crop",
      title: "Nueva Temporada",
      subtitle: "Elegancia para las más pequeñas",
      link: "/shop"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1287&auto=format&fit=crop",
      title: "Días de Sol",
      subtitle: "Frescura y color en cada diseño",
      link: "/shop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-[#0f1c29]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-secondary tracking-[0.3em] uppercase text-sm font-bold mb-4 animate-fade-in-up">
              {slide.subtitle}
            </span>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 italic animate-fade-in-up stagger-1">
              {slide.title}
            </h2>
            <Link
              to={slide.link}
              className="px-8 py-3 border border-white text-white hover:bg-white hover:text-primary transition-colors uppercase tracking-widest text-xs font-bold animate-fade-in-up stagger-2"
            >
              Ver Colección
            </Link>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-primary transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-primary transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    openCart();
  };

  const nextProducts = () => {
    if (currentIndex < products.length - 4) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevProducts = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Hero Section - Boutique Xiomi Exclusive */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/20 to-rose-100/20 rounded-full blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-px bg-rose-300" />
            <span className="text-rose-400 font-medium uppercase tracking-[0.25em] text-xs">Boutique Xiomi Perú</span>
            <div className="w-12 h-px bg-rose-300" />
          </div>

          <h1 className="mb-8">
            <span className="block text-5xl md:text-7xl font-serif text-[#4b0028] mb-2">Pequeñas</span>
            <span className="block text-6xl md:text-9xl font-serif italic text-[#e45f7a] tracking-tight">Princesas</span>
            <span className="block text-lg md:text-xl font-light text-[#4b0028]/60 tracking-[0.4em] uppercase mt-4">Vestidos de Ensueño</span>
          </h1>

          <p className="text-lg md:text-xl text-[#4b0028]/70 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            En <strong className="text-[#e45f7a]">Boutique Xiomi</strong> creamos momentos mágicos. Cada vestido es una obra de arte diseñada para que las más pequeñas brillen en sus ocasiones más especiales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <button className="px-10 py-4 bg-[#4b0028] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#e45f7a] transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl rounded-full">
                Ver Colección
              </button>
            </Link>
            <Link to="/about">
              <button className="px-10 py-4 bg-white text-[#4b0028] font-bold uppercase tracking-widest text-sm border-2 border-[#4b0028] hover:bg-[#4b0028] hover:text-white transition-all rounded-full">
                Nuestra Historia
              </button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-[#4b0028]/50 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Envío a todo Perú</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" /></svg>
              <span>Precios exclusivos</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span>Calidad premium</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-[#4b0028]/40 uppercase tracking-widest">Descubre más</span>
          <svg className="w-5 h-5 text-[#4b0028]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* Featured Carousel Section */}
      <CarouselSection />

      {/* Product Showcase */}
      <section className={styles.products.section}>
        <div className={styles.products.container}>
          <div className="text-center mb-16 relative">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm md:text-base">Nuestros Favoritos</span>
            <h2 className="text-4xl md:text-5xl font-serif text-primary mt-3">Vestidos Destacados</h2>
            {/* Decorative element */}
            <div className="w-24 h-1 bg-secondary mx-auto mt-6" />
          </div>

          <div className="relative">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-stone-600">Cargando vestidos destacados...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-600">No hay productos destacados disponibles</p>
                <Link to="/shop" className="text-primary hover:underline mt-2 inline-block">Ver tienda</Link>
              </div>
            ) : (
              <>
                {/* Carousel Container */}
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-out gap-8"
                    style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
                  >
                    {products.map((product) => (
                      <div key={product.id} className="flex-shrink-0" style={{ width: 'calc(25% - 24px)' }}>
                        <ProductCard
                          product={product}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                          onViewProduct={setViewingProduct}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {products.length > 4 && (
                  <>
                    <button
                      onClick={prevProducts}
                      disabled={currentIndex === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      onClick={nextProducts}
                      disabled={currentIndex >= products.length - 4}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>



      <ProductViewer
        product={viewingProduct}
        products={products}
        isOpen={viewingProduct !== null}
        onClose={() => setViewingProduct(null)}
        onAddToCart={handleAddToCart}
        onSwitchProduct={setViewingProduct}
      />
    </div>
  );
};

const styles = {
  wrapper: "flex flex-col w-full overflow-x-hidden bg-white",

  hero: {
    section: "relative min-h-screen flex items-center justify-center overflow-hidden bg-accent-vanilla",
    overlay: "absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1035&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay",
    content: "relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center",
    badge: "inline-block py-1 px-4 border border-primary text-primary text-xs font-bold uppercase tracking-[0.3em] mb-6",
    title: "mb-8",
    description: "text-lg text-primary/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed",
    actions: "flex flex-col sm:flex-row gap-4 justify-center",
    primaryBtn: "px-10 py-4 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-secondary transition-all shadow-lg hover:-translate-y-1",
  },

  products: {
    section: "py-32 bg-white",
    container: "max-w-7xl mx-auto px-6",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12",
    card: "group cursor-pointer",
    imageWrapper: "relative h-[400px] overflow-hidden bg-gray-100",
    image: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
  }
};