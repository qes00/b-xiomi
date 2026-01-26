import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '../types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    // Computed
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product: Product) => {
                set((state) => {
                    const existingItem = state.items.find(item => item.id === product.id);

                    if (existingItem) {
                        return {
                            items: state.items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            isOpen: true,
                        };
                    }

                    return {
                        items: [...state.items, { ...product, quantity: 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== productId),
                }));
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set((state) => ({
                    items: state.items.map(item =>
                        item.id === productId
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'allahu-cart-storage',
            partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
        }
    )
);

// Selector hooks for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsOpen = () => useCartStore((state) => state.isOpen);
export const useCartActions = () => useCartStore((state) => ({
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    openCart: state.openCart,
    closeCart: state.closeCart,
}));
