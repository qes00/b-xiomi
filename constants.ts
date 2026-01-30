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
    name: 'Vestido de Gala Rosa Encantado',
    description: 'Vestido elegante de tul con detalles bordados a mano. Ideal para fiestas y eventos especiales.',
    price: 189.90,
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1035&auto=format&fit=crop',
    category: 'Gala',
    brand: 'Boutique Xiomi',
    sizes: ['2', '4', '6', '8'],
    colors: ['Rosa Intenso', 'Blanco Hueso']
  },
  {
    id: '2',
    name: 'Vestido Casual Menta Fresca',
    description: 'Vestido de algodón 100% peruano, ligero y cómodo para el día a día.',
    price: 95.50,
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1074&auto=format&fit=crop',
    category: 'Casual',
    brand: 'Boutique Xiomi',
    sizes: ['4', '6', '8', '10', '12'],
    colors: ['Verde Menta', 'Azul Cielo']
  },
  {
    id: '3',
    name: 'Vestido de Flores Primavera',
    description: 'Hermoso estampado floral con falda amplia. Perfecto para una tarde de sol.',
    price: 120.00,
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1287&auto=format&fit=crop',
    category: 'Casual',
    brand: 'Boutique Xiomi',
    sizes: ['2', '4', '6', '8'],
    colors: ['Vainilla', 'Azul Cielo']
  },
  {
    id: '4',
    name: 'Vestido de Fiesta Cielo Estrellado',
    description: 'Vestido con detalles brillantes y cintas de satén. Hará que se sienta como una princesa.',
    price: 210.90,
    imageUrl: 'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?q=80&w=1106&auto=format&fit=crop',
    category: 'Fiesta',
    brand: 'Boutique Xiomi',
    sizes: ['6', '8', '10', '12'],
    colors: ['Azul Cielo', 'Rosa Pastel']
  },
  {
    id: '5',
    name: 'Vestido Vintage Encaje Blanco',
    description: 'Estilo clásico con encaje fino y forro suave de algodón. Elegancia atemporal.',
    price: 245.00,
    imageUrl: 'https://images.unsplash.com/photo-1533222535026-62024220b22a?q=80&w=1287&auto=format&fit=crop',
    category: 'Bautizo/Primera Comunión',
    brand: 'Boutique Xiomi',
    sizes: ['4', '6', '8', '10'],
    colors: ['Blanco Hueso']
  },
  {
    id: '6',
    name: 'Vestido de Punto Invierno Dulce',
    description: 'Vestido de lana suave de alpaca blend. Calidez y estilo para los días fríos.',
    price: 149.90,
    imageUrl: 'https://images.unsplash.com/photo-1549419163-95295c6f1406?q=80&w=1287&auto=format&fit=crop',
    category: 'Invierno',
    brand: 'Boutique Xiomi',
    sizes: ['2', '4', '6', '8'],
    colors: ['Rosa Pastel', 'Gris']
  },
  {
    id: '7',
    name: 'Vestido de Tul Bailarina',
    description: 'Falda de múltiples capas de tul para un volumen espectacular y mucha diversión.',
    price: 135.50,
    imageUrl: 'https://images.unsplash.com/photo-1517409247167-33f7c4ccd821?q=80&w=1287&auto=format&fit=crop',
    category: 'Fantasía',
    brand: 'Boutique Xiomi',
    sizes: ['2', '4', '6', '8'],
    colors: ['Rosa Intenso', 'Lila']
  },
  {
    id: '8',
    name: 'Conjunto de Vestido y Torerita',
    description: 'Set coordinado de vestido de verano con una pequeña chaqueta tejida.',
    price: 115.00,
    imageUrl: 'https://images.unsplash.com/photo-1519278401-1b12b327b7c2?q=80&w=1287&auto=format&fit=crop',
    category: 'Conjuntos',
    brand: 'Boutique Xiomi',
    sizes: ['4', '6', '8', '10'],
    colors: ['Vainilla', 'Rosa Pastel']
  }
];