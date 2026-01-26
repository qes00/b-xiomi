// URL del Backend en Cloud Run (Simulada para este entorno)
export const API_BASE_URL = 'https://api-cloud-run-service-xyz.run.app/api';

// Configuración Regional Perú
export const CURRENCY_CODE = 'PEN';
export const IGV_RATE = 0.18;

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(amount);
};

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Polo Algodón Pima Premium',
    description: 'Polo básico de alta calidad hecho con el mejor algodón peruano. Fresco y duradero.',
    price: 89.90,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    category: 'Ropa',
    brand: 'Pima Cotton Co.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Negro', 'Azul Marino']
  },
  {
    id: '2',
    name: 'Zapatillas Urbanas Lima',
    description: 'Diseño moderno para caminar por la ciudad. Suela ergonómica.',
    price: 249.50,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    category: 'Calzado',
    brand: 'Urban Step',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Negro', 'Gris', 'Marrón']
  },
  {
    id: '3',
    name: 'Mochila Andina',
    description: 'Mochila resistente con diseños inspirados en telares tradicionales.',
    price: 120.00,
    imageUrl: 'https://picsum.photos/400/400?random=3',
  },
  {
    id: '4',
    name: 'Cartera de Cuero Genuino',
    description: 'Cartera artesanal de cuero peruano. Elegante y durable con múltiples compartimentos.',
    price: 159.90,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    category: 'Accesorios'
  },
  {
    id: '5',
    name: 'Chompa Alpaca Premium',
    description: 'Suéter tejido a mano con lana de alpaca 100% natural. Abrigador y suave.',
    price: 299.00,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    category: 'Ropa',
    brand: 'Alpaca Perú',
    sizes: ['S', 'M', 'L'],
    colors: ['Beige', 'Gris', 'Marrón']
  },
  {
    id: '6',
    name: 'Sombrero de Paja Toquilla',
    description: 'Sombrero tradicional tejido a mano. Perfecto para el sol.',
    price: 79.90,
    imageUrl: 'https://picsum.photos/400/400?random=6',
    category: 'Accesorios'
  },
  {
    id: '7',
    name: 'Pantalón Denim Nacional',
    description: 'Jean de corte moderno con tela resistente. Diseño casual urbano.',
    price: 189.50,
    imageUrl: 'https://picsum.photos/400/400?random=7',
    category: 'Ropa',
    brand: 'Denim Nacional',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Azul', 'Negro']
  },
  {
    id: '8',
    name: 'Billetera Minimalista',
    description: 'Billetera compacta de cuero genuino con diseño slim.',
    price: 69.90,
    imageUrl: 'https://picsum.photos/400/400?random=8',
    category: 'Accesorios'
  }
];