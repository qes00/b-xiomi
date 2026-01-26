export interface ProductImage {
  url: string;
  color?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;  // Mantener por compatibilidad
  images?: ProductImage[];  // Nueva propiedad para múltiples imágenes
  category: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UploadResponse {
  message: string;
  imageUrl: string;
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// User Profile Types
export interface UserAddress {
  id: string;
  street: string;
  district: string; // Distrito
  province: string; // Provincia
  department: string; // Departamento
  reference?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'DNI' | 'RUC' | 'CE';
  documentNumber: string;
  addresses: UserAddress[];
}

// Admin Panel - Coupon System
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
}

// Admin Panel - Inventory Management
export interface InventoryItem {
  productId: string;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  lastUpdated: Date;
}

// Custom Variant Types (e.g., "Talla", "Color", "Material", "Estilo")
export interface VariantType {
  id: string;
  name: string;
  values: string[];
}

// Per-variant inventory tracking
export interface VariantInventory {
  id: string;
  productId: string;
  variantCombination: { [key: string]: string }; // e.g., { "Talla": "M", "Color": "Azul" }
  stock: number;
  reserved: number;
  sku?: string;
}

// Admin Panel - Scheduled Pricing
export interface ScheduledPrice {
  id: string;
  productId: string;
  specialPrice: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// Admin Panel - Promotional Popups
export interface PromotionalPopup {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  startDate: Date;
  endDate: Date;
  displayRules: {
    showOnce?: boolean;
    targetPages?: string[];
    delaySeconds?: number;
  };
  isActive: boolean;
  createdAt: Date;
}

// Order Management
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    city: string;
  };
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile Data
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  district?: string;
  city?: string;
}