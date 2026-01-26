/**
 * Servicio de generación de descripciones de productos
 * Versión sin dependencias externas - genera descripciones predeterminadas
 */

// Plantillas de descripciones por categoría
const descriptionTemplates: Record<string, string[]> = {
  'Ropa': [
    '✨ Confeccionado con materiales de primera calidad. Diseño moderno que combina comodidad y estilo peruano.',
    '🌟 Prenda premium con acabados de alta costura. Ideal para el día a día con elegancia.',
    '💫 Calidad superior y confort garantizado. Diseño exclusivo que realza tu estilo personal.',
  ],
  'Calzado': [
    '👟 Diseño ergonómico para máxima comodidad. Suela duradera y estilo urbano moderno.',
    '✨ Calzado premium con tecnología de amortiguación. Perfecto para largas caminatas.',
    '🌟 Materiales de alta calidad y diseño vanguardista. Comodidad todo el día.',
  ],
  'Accesorios': [
    '💎 Accesorio elegante que complementa cualquier outfit. Materiales duraderos y diseño sofisticado.',
    '✨ Artículo premium con acabados de alta calidad. Estilo que marca la diferencia.',
    '🌟 Diseño exclusivo inspirado en la artesanía peruana. Elegancia y funcionalidad.',
  ],
  'Tecnología': [
    '📱 Tecnología de última generación con funciones avanzadas. Rendimiento superior garantizado.',
    '⚡ Dispositivo potente y eficiente. Diseño moderno con las mejores prestaciones.',
    '🔌 Innovación y calidad en cada detalle. La mejor inversión en tecnología.',
  ],
  'default': [
    '✨ Producto de alta calidad seleccionado especialmente para ti. Satisfacción garantizada.',
    '🌟 Excelente relación calidad-precio. Diseño pensado para el consumidor peruano moderno.',
    '💫 Artículo premium con los mejores estándares de calidad. ¡No te arrepentirás!',
  ]
};

/**
 * Genera una descripción para un producto basada en su nombre y categoría
 * Esta versión no usa APIs externas, genera descripciones predefinidas.
 */
export const generateSmartDescription = async (productName: string, category: string): Promise<string> => {
  // Simular un pequeño delay para mejor UX
  await new Promise(resolve => setTimeout(resolve, 300));

  // Obtener plantillas de la categoría o usar default
  const templates = descriptionTemplates[category] || descriptionTemplates['default'];

  // Seleccionar una plantilla aleatoria
  const randomIndex = Math.floor(Math.random() * templates.length);
  let description = templates[randomIndex];

  // Personalizar con el nombre del producto si es posible
  if (productName.length > 3) {
    const productTerms = productName.split(' ').filter(t => t.length > 2);
    if (productTerms.length > 0) {
      // Agregar mención del producto al inicio ocasionalmente
      if (Math.random() > 0.5) {
        description = `${productTerms[0]} de excelente calidad. ${description}`;
      }
    }
  }

  return description;
};

/**
 * Verifica si el servicio de IA está disponible
 * En esta versión siempre retorna true ya que no depende de APIs externas
 */
export const isAIServiceAvailable = (): boolean => {
  return true;
};