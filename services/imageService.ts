/**
 * Image Service - Conversión y Carga de Imágenes WebP
 * @description Utilidad para comprimir y convertir imágenes a formato WebP
 */

// Configuración por defecto
const DEFAULT_QUALITY = 0.85; // 85% de calidad
const DEFAULT_MAX_WIDTH = 1200; // Ancho máximo
const DEFAULT_MAX_HEIGHT = 1200; // Alto máximo
const THUMBNAIL_SIZE = 300; // Tamaño de miniatura

// URL del endpoint de carga (configurar según hosting)
const UPLOAD_ENDPOINT = '/api/upload.php';

export interface ImageUploadResult {
    success: boolean;
    imageUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
}

export interface ConversionOptions {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    generateThumbnail?: boolean;
}

/**
 * Convierte una imagen a formato WebP
 * @param file - Archivo de imagen original
 * @param options - Opciones de conversión
 * @returns Blob de la imagen en formato WebP
 */
export const convertToWebP = async (
    file: File,
    options: ConversionOptions = {}
): Promise<Blob> => {
    const {
        quality = DEFAULT_QUALITY,
        maxWidth = DEFAULT_MAX_WIDTH,
        maxHeight = DEFAULT_MAX_HEIGHT,
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Calcular dimensiones manteniendo aspect ratio
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error('No se pudo obtener contexto del canvas'));
                return;
            }

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a WebP
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al convertir imagen a WebP'));
                    }
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };

        // Cargar imagen desde archivo
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Genera un thumbnail de la imagen
 */
export const generateThumbnail = async (
    file: File,
    size: number = THUMBNAIL_SIZE
): Promise<Blob> => {
    return convertToWebP(file, {
        maxWidth: size,
        maxHeight: size,
        quality: 0.75,
    });
};

/**
 * Comprime una imagen manteniendo su formato original
 */
export const compressImage = async (
    file: File,
    quality: number = DEFAULT_QUALITY
): Promise<Blob> => {
    // Para formatos no-WebP, usar WebP de todas formas (mejor compresión)
    return convertToWebP(file, { quality });
};

/**
 * Helper para generar respuesta mock en desarrollo
 */
const getMockUploadResult = async (blob: Blob, originalSize: number, compressedSize: number): Promise<ImageUploadResult> => {
    const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
    
    return {
        success: true,
        imageUrl: base64,
        thumbnailUrl: base64,
        originalSize,
        compressedSize,
        compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
    };
};

/**
 * Sube una imagen al servidor (hosting)
 */
export const uploadImage = async (
    file: File,
    options: ConversionOptions = {}
): Promise<ImageUploadResult> => {
    const originalSize = file.size;

    try {
        // Convertir a WebP
        const webpBlob = await convertToWebP(file, options);
        const compressedSize = webpBlob.size;

        // Generar nombre único
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `img_${timestamp}_${randomStr}.webp`;

        // Preparar FormData
        const formData = new FormData();
        formData.append('image', webpBlob, fileName);

        // Generar thumbnail si se solicita
        let thumbnailUrl: string | undefined;
        if (options.generateThumbnail !== false) {
            const thumbnailBlob = await generateThumbnail(file);
            const thumbnailName = `thumb_${timestamp}_${randomStr}.webp`;
            formData.append('thumbnail', thumbnailBlob, thumbnailName);
        }

        // Subir al servidor
        let response;
        try {
            response = await fetch(UPLOAD_ENDPOINT, {
                method: 'POST',
                body: formData,
            });
        } catch (fetchError) {
            // Si falla la conexión en desarrollo, usar fallback
            if (import.meta.env.DEV) {
                console.warn("⚠️ Servidor PHP no detectado. Usando mock upload para desarrollo.");
                return await getMockUploadResult(webpBlob, originalSize, compressedSize);
            }
            throw fetchError;
        }

        if (!response.ok) {
            // Si responde 404 en desarrollo (no existe upload.php), usar fallback
            if (response.status === 404 && import.meta.env.DEV) {
                 console.warn("⚠️ Endpoint upload.php no encontrado (404). Usando mock upload.");
                 return await getMockUploadResult(webpBlob, originalSize, compressedSize);
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Verificar si la respuesta es JSON válidos
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Respuesta no es JSON (posiblemente SPA fallback). Usando mock upload.");
                return await getMockUploadResult(webpBlob, originalSize, compressedSize);
            }
            throw new Error("El servidor no devolvió una respuesta JSON válida");
        }

        let result;
        try {
            result = await response.json();
        } catch (e) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Error parseando JSON. Usando mock upload.");
                return await getMockUploadResult(webpBlob, originalSize, compressedSize);
            }
            throw new Error("Error al procesar la respuesta del servidor");
        }

        if (result.success) {
            return {
                success: true,
                imageUrl: result.imageUrl,
                thumbnailUrl: result.thumbnailUrl,
                originalSize,
                compressedSize,
                compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
            };
        } else {
            throw new Error(result.error || 'Error al subir imagen');
        }
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            originalSize,
        };
    }
};

/**
 * Convierte imagen a base64 WebP (para preview)
 */
export const imageToBase64WebP = async (file: File): Promise<string> => {
    const webpBlob = await convertToWebP(file, { quality: 0.7 });

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(webpBlob);
    });
};

/**
 * Valida si un archivo es una imagen válida
 */
export const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    return validTypes.includes(file.type);
};

/**
 * Obtiene las dimensiones de una imagen
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Formatea el tamaño de archivo para visualización
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
