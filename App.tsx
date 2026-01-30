import React, { useState, Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { Product, CartItem } from './types';
import { getProducts } from './services/productService';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { ProductViewer } from './components/ProductViewer';
import { StoreFilters, FilterState } from './components/StoreFilters';
import { ToastProvider, useToast } from './components/Toast';
import { NotFoundPage } from './components/NotFoundPage';
import { PageLoader } from './components/LoadingSpinner';
import { SEOProvider, SEOHead } from './components/SEOHead';
import { useCartStore } from './stores/cartStore';
import { useAuthStore } from './stores/authStore';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { ComplaintBook } from './pages/ComplaintBook';
import { AboutUs } from './pages/AboutUs';
import { Campaigns } from './pages/Campaigns';
import { Blog } from './pages/Blog';

// Lazy load heavy components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const UserPanel = lazy(() => import('./components/UserPanel'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// Helper for navbar to highlight active link
const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={isActive ? styles.navLink.active : styles.navLink.inactive}
    >
      {children}
    </Link>
  );
};

// Navbar Component
const Navbar: React.FC<{ cartCount: number; onOpenCart: () => void; isAuthenticated: boolean; isAdmin: boolean; onLogout: () => void; onShowLogin: () => void }> = ({ cartCount, onOpenCart, isAuthenticated, isAdmin, onLogout, onShowLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setShowLoginModal = onShowLogin;

  return (
    <nav className={styles.navbar.container}>
      <div className={styles.navbar.wrapper}>
        <div className={styles.navbar.content}>
          <div className="flex items-center">
            <Link to="/" className={styles.navbar.brand}>
              ALLAHU AKBAR <span className={styles.navbar.brandHighlight}>SHOP</span>
            </Link>
            <div className={styles.navbar.desktopMenu}>
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/about">Nosotros</NavLink>
              <NavLink to="/shop">Tienda</NavLink>
              <NavLink to="/blog">Blog</NavLink>
              <NavLink to="/campaigns">Campaña</NavLink>
              {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/profile" className={styles.navbar.iconButton}>
                <span className="sr-only">Perfil</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            ) : (
              <button onClick={onShowLogin} className={styles.navbar.iconButton}>
                <span className="sr-only">Iniciar Sesión</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </button>
            )}
            {isAuthenticated && (
              <button onClick={onLogout} className={styles.navbar.iconButton} title="Cerrar Sesión">
                <span className="sr-only">Cerrar Sesión</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            )}
            <button
              onClick={onOpenCart}
              className={styles.navbar.cartButton}
            >
              <span className="sr-only">Ver carrito</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cartCount > 0 && (
                <span className={styles.navbar.cartCount}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={styles.navbar.mobileMenuBtn}
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu.container}>
          <div className={styles.mobileMenu.content}>
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</NavLink>
            <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</NavLink>
            <NavLink to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Tienda</NavLink>
            <NavLink to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</NavLink>
            <NavLink to="/campaigns" onClick={() => setIsMobileMenuOpen(false)}>Campaña</NavLink>
            {isAdmin && <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</NavLink>}
          </div>
        </div>
      )}
    </nav>
  );
};

// Storefront Component
const Storefront: React.FC<{ products: Product[]; loading: boolean; addToCart: (p: Product, quantity?: number) => void }> = ({ products, loading, addToCart }) => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialSearch,
    selectedCategories: [],
    priceRange: [0, 1000],
    selectedSizes: [],
    selectedColors: []
  });
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Update search query if URL param changes
  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null && search !== filters.searchQuery) {
      setFilters(prev => ({ ...prev, searchQuery: search }));
    }
  }, [searchParams]);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 300;

  // Extract all available sizes and colors from products
  const availableSizes = Array.from(new Set(products.flatMap(p => p.sizes || [])));
  const availableColors = Array.from(new Set(products.flatMap(p => p.colors || [])));

  const filteredProducts = products.filter(product => {
    // Search filter
    if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    // Category filter
    if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(product.category)) {
      return false;
    }
    // Size filter
    if (filters.selectedSizes.length > 0) {
      if (!product.sizes || !product.sizes.some(size => filters.selectedSizes.includes(size))) {
        return false;
      }
    }
    // Color filter
    if (filters.selectedColors.length > 0) {
      if (!product.colors || !product.colors.some(color => filters.selectedColors.includes(color))) {
        return false;
      }
    }
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    return true;
  });

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <PageLoader text="Cargando productos..." />
      </div>
    );
  }

  return (
    <div className={styles.storefront.container}>
      <div className="mb-6">
        <h1 className={styles.storefront.title}>Catálogo Completo</h1>
        <p className={styles.storefront.subtitle}>Explora los mejores productos peruanos a un click de distancia.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <StoreFilters
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
            maxPrice={maxPrice}
            availableSizes={availableSizes}
            availableColors={availableColors}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className={styles.storefront.grid}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewProduct={setViewingProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12">
              <div className="text-center mb-8">
                <p className="text-stone-500 text-lg font-medium">No se encontraron productos con estos filtros</p>
              </div>
              
              {/* Recommendation section when no results */}
              <div className="mt-8 pt-8 border-t border-stone-200">
                <h3 className="text-2xl font-serif text-[#0f1c29] mb-6 text-center">Productos que te podrían gustar</h3>
                <div className={styles.storefront.grid}>
                  {products.slice(0, 8).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onViewProduct={setViewingProduct}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

const App: React.FC = () => {
  // Zustand cart store (persisted to localStorage)
  const { items: cart, isOpen: isCartOpen, openCart, closeCart, addItem, removeItem, clearCart, getTotalItems } = useCartStore();

  // Auth store con Supabase
  const { user, isLoading: authLoading, isInitialized, initialize, signIn, signOut } = useAuthStore();
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const currentUser = useAuthStore.getState().user;
    
    // Si hay un admin logueado, cerrar sesión primero para evitar conflictos
    if (currentUser?.role === 'admin') {
      await signOut();
      // Pequeña espera para asegurar que el logout se complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const result = await signIn(email, password);
    if (result.success) {
      setShowLoginModal(false);
      window.location.hash = '#/profile';
    } else {
      alert(result.error || 'Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Wrapper for addItem that also opens cart
  const addToCart = (product: Product) => {
    addItem(product);
  };

  const cartCount = getTotalItems();

  return (
    <Router>
      <SEOProvider>
        <ToastProvider>
          <SEOHead />
          <div className={styles.app.container}>
            <Navbar cartCount={cartCount} onOpenCart={openCart} isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} onShowLogin={() => setShowLoginModal(true)} />

            <main className="flex-grow">
              <Suspense fallback={<PageLoader text="Cargando..." />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/shop" element={<Storefront products={products} loading={productsLoading} addToCart={addToCart} />} />
                  <Route path="/admin-login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={
                    isAdmin ? <AdminPanel /> : <Navigate to="/" replace />
                  } />
                  <Route path="/profile" element={
                    isAuthenticated ? <UserPanel cart={cart} /> : <Navigate to="/" replace />
                  } />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/checkout" element={
                    <CheckoutPage 
                      cart={cart.map(item => ({ product: item, quantity: item.quantity }))} 
                      onClearCart={clearCart}
                      isAuthenticated={isAuthenticated}
                      onShowLogin={() => setShowLoginModal(true)}
                    />
                  } />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/complaints" element={<ComplaintBook />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>

            <CartSidebar
              isOpen={isCartOpen}
              onClose={closeCart}
              cart={cart}
              onRemove={removeItem}
            />

            <footer className={styles.footer.container}>
              <div className={styles.footer.wrapper}>
                <div className={styles.footer.grid}>
                  <div>
                    <h3 className={styles.footer.title}>Legales</h3>
                    <ul className={styles.footer.list}>
                      <li><Link to="/terms" className={styles.footer.link}>Términos y Condiciones</Link></li>
                      <li><Link to="/complaints" className={styles.footer.link}>Libro de Reclamaciones</Link></li>
                      <li className="mt-4">
                        <Link to="/complaints">
                          <img src="https://www.indecopi.gob.pe/documents/20182/227448/libro-de-reclamaciones-v2.png" alt="Libro de Reclamaciones" className="h-12 bg-white p-1 rounded" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.footer.title}>Sobre Nosotros</h3>
                    <ul className={styles.footer.list}>
                      <li><Link to="/about" className={styles.footer.link}>Nuestra misión</Link></li>
                      <li><Link to="/campaigns" className={styles.footer.link}>Campañas</Link></li>
                      <li><Link to="/shop" className={styles.footer.link}>Tienda</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.footer.title}>Redes Sociales</h3>
                    <div className="flex gap-4 items-center">
                      <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-gold-500 hover:text-black transition-all">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-gold-500 hover:text-black transition-all">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                      </a>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-gold-500 hover:text-black transition-all">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                      <a href="mailto:alahuakbarperu@gmail.com" className="bg-white/10 p-2 rounded-full hover:bg-gold-500 hover:text-black transition-all">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={styles.footer.copyright}>
                  © 2026 Allahu Akbar® Peru. Todos los derechos reservados.
                </div>
              </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
              href="https://wa.me/123456789?text=Hola!%20Deseo%20información%20sobre%20tus%20productos"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-slow"
              title="Soporte WhatsApp"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.308 1.655zm6.757-4.041c1.558.924 3.01 1.393 4.586 1.394 5.42 0 9.832-4.412 9.834-9.832.001-2.628-1.023-5.097-2.887-6.962s-4.332-2.891-6.96-2.892c-5.421 0-9.833 4.412-9.835 9.832-.001 1.737.478 3.43 1.385 4.911l-.985 3.593 3.682-.966zm10.707-1.391c-.24-.12-.1.417-2.427-4.108-.239-.12-.413-.18-.594-.18-.18 0-.362.06-.66.36s-.72.84-.87 1.02-.33.21-.57.09c-1.121-.555-1.921-1.077-2.684-2.383-.21-.36.21-.33.6-.96.12-.24.06-.45-.03-.63s-.782-1.884-1.071-2.583c-.282-.676-.569-.584-.781-.595-.201-.01-.432-.012-.662-.012s-.6.09-.913.437c-.313.348-1.196 1.168-1.196 2.848s1.229 3.297 1.402 3.526c.172.228 2.417 3.692 5.857 5.176 2.046.884 2.809 1.01 3.81 1.02.585.006 1.129.01 1.64.015.424.004.795.008 1.107.01.21-.001.42-.002.63-.004s.42-.005.63-.01c.21-.005.42-.01.63-.015.21-.005.42-.012.63-.02.21-.008.42-.018.63-.03.21-.012.42-.026.63-.04s.42-.032.63-.05c.21-.018.42-.038.63-.06s.42-.045.63-.07c.21-.025.42-.05.63-.08s.42-.06.63-.09.42-.065.63-.1c.21-.035.42-.07.63-.11s.42-.08.63-.12.42-.09.63-.14c.21-.05.42-.1.63-.15.21-.05.42-.1.63-.16.21-.06.417-.123.6-.183.18-.06.313-.105.347-.113.111-.027.234-.147.234-.347v-.55z"/></svg>
            </a>

            <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              onLogin={handleLogin}
              onForgotPassword={() => {
                setShowLoginModal(false);
                window.location.hash = '#/reset-password';
              }}
            />
          </div>
        </ToastProvider>
      </SEOProvider>
    </Router>
  );
};

const styles = {
  app: {
    container: "min-h-screen bg-bone flex flex-col font-sans text-[#0f1c29]"
  },
  navLink: {
    active: "px-2 py-1 border-b-2 border-gold-500 text-[#0f1c29] font-serif font-bold italic transition-all",
    inactive: "px-2 py-1 border-b-2 border-transparent text-[#3c6e96] hover:text-[#0f1c29] transition-all font-medium"
  },
  navbar: {
    container: "sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm",
    wrapper: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    content: "flex items-center justify-between h-20",
    brand: "text-[#0f1c29] font-serif font-bold text-2xl tracking-tighter flex items-center gap-1",
    brandHighlight: "text-gold-500 italic",
    desktopMenu: "hidden md:flex ml-12 items-center gap-8",
    iconButton: "p-2 rounded-full text-[#3c6e96] hover:text-[#0f1c29] hover:bg-stone-50 transition-all",
    cartButton: "p-2 rounded-full text-[#3c6e96] hover:text-[#0f1c29] hover:bg-stone-50 transition-all relative",
    cartCount: "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gold-500 rounded-full",
    mobileMenuBtn: "p-2 rounded-full text-[#0f1c29] hover:bg-stone-50"
  },
  mobileMenu: {
    container: "md:hidden bg-white border-t border-stone-100",
    content: "px-4 pt-3 pb-4 space-y-1 flex flex-col"
  },
  storefront: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
    title: "text-4xl md:text-5xl font-serif font-bold text-[#0f1c29] mb-2",
    subtitle: "text-[#3c6e96] font-light",
    grid: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
  },
  footer: {
    container: "bg-[#0f1c29] text-white mt-auto pt-16 pb-8",
    wrapper: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    grid: "grid grid-cols-1 md:grid-cols-3 gap-12 mb-12",
    title: "font-serif text-xl italic text-gold-400 mb-6",
    text: "text-sm text-[#a6c2e0] leading-relaxed font-light max-w-xs",
    list: "text-sm text-[#a6c2e0] space-y-3 font-light",
    link: "hover:text-gold-400 transition-colors",
    copyright: "border-t border-[#1e3850] pt-8 text-center text-xs text-[#7fa6c8] uppercase tracking-widest"
  }
};

export default App;