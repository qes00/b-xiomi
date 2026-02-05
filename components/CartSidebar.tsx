import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { formatCurrency, IGV_RATE } from '../constants';
import { Button } from './Button';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onRemove }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // In Peru, displayed prices usually include IGV. 
  // We calculate the base price by dividing by 1.18
  const basePrice = total / (1 + IGV_RATE);
  const igvAmount = total - basePrice;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar.container} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className={styles.sidebar.header}>
          <h2 className="text-xl font-bold text-black">Tu Carrito</h2>
          <button onClick={onClose} className={styles.sidebar.closeBtn}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className={styles.sidebar.content}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.item.container}>
                <img src={item.imageUrl} alt={item.name} className={styles.item.image} />
                <div className="flex-1">
                  <h4 className={styles.item.name}>{item.name}</h4>
                  <div className={styles.item.details}>
                    <span className="text-sm text-stone-700 font-medium">Cant: {item.quantity}</span>
                    <span className="font-bold text-gold-700">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className={styles.item.removeBtn}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer.container}>
            <div className="space-y-2 mb-4">
              <div className={styles.footer.row}>
                <span>Subtotal (Base)</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              <div className={styles.footer.row}>
                <span>IGV (18%)</span>
                <span>{formatCurrency(igvAmount)}</span>
              </div>
              <div className={styles.footer.totalRow}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button onClick={handleCheckout} className={styles.footer.button}>
              Ir a Pagar →
            </Button>
            <p className={styles.footer.disclaimer}>Transacciones seguras procesadas externamente.</p>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  overlay: "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
  sidebar: {
    container: "fixed top-0 right-0 h-full w-[90%] sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col",
    header: "p-5 border-b border-gold-400 flex justify-between items-center bg-gold-500",
    closeBtn: "p-2 hover:bg-black/10 rounded-full text-black",
    content: "flex-1 overflow-y-auto p-5 space-y-4",
  },
  emptyCart: "text-center text-stone-500 mt-20 font-medium",
  item: {
    container: "flex gap-4 border-b border-stone-200 pb-4 last:border-0",
    image: "w-20 h-20 rounded-md object-cover bg-stone-100",
    name: "font-bold text-black line-clamp-1",
    details: "flex justify-between items-center mt-2",
    removeBtn: "text-xs text-red-600 mt-2 hover:text-red-800 hover:underline font-medium"
  },
  footer: {
    container: "p-6 border-t border-gold-200 bg-white",
    row: "flex justify-between text-sm text-stone-800 font-medium",
    totalRow: "flex justify-between text-lg font-bold text-black pt-2 border-t border-stone-200",
    button: "w-full py-3 text-lg bg-gold-500 hover:bg-gold-400 text-black",
    disclaimer: "text-center text-xs text-stone-500 mt-3 font-medium"
  }
};