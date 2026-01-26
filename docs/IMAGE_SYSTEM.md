# Sistema de Imágenes WebP

Sistema de conversión y optimización de imágenes para ALLAHU-STORE.

## Características

- ✅ Conversión automática a WebP
- ✅ Compresión configurable (por defecto 85%)
- ✅ Redimensionamiento automático (máx 1200x1200)
- ✅ Generación de thumbnails (300x300)
- ✅ Almacenamiento en hosting local

## Uso Básico

### Importar el servicio

```typescript
import { 
  convertToWebP, 
  uploadImage, 
  imageToBase64WebP,
  formatFileSize 
} from './services/imageService';
```

### Convertir imagen a WebP

```typescript
const file = inputElement.files[0];
const webpBlob = await convertToWebP(file, { quality: 0.85 });
```

### Subir imagen con compresión

```typescript
const result = await uploadImage(file, {
  quality: 0.85,
  maxWidth: 1200,
  maxHeight: 1200,
  generateThumbnail: true
});

if (result.success) {
  console.log('URL:', result.imageUrl);
  console.log('Thumbnail:', result.thumbnailUrl);
  console.log(`Compresión: ${result.compressionRatio}%`);
}
```

### Preview en Base64

```typescript
const base64 = await imageToBase64WebP(file);
// Usar en <img src={base64} />
```

## Configuración del Hosting

### 1. Crear carpeta de uploads

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 2. Configurar .htaccess (si es necesario)

```apache
# En public/uploads/.htaccess
<FilesMatch "\.(webp|jpg|png)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### 3. Ajustar endpoint en imageService.ts

```typescript
// Cambiar según tu hosting
const UPLOAD_ENDPOINT = '/api/upload.php';
```

## API del Servicio

### `convertToWebP(file, options)`
Convierte imagen a formato WebP.

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| quality | number | 0.85 | Calidad (0-1) |
| maxWidth | number | 1200 | Ancho máximo |
| maxHeight | number | 1200 | Alto máximo |

### `uploadImage(file, options)`
Sube imagen al servidor.

Retorna:
```typescript
{
  success: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}
```

### `generateThumbnail(file, size)`
Genera miniatura cuadrada.

### `isValidImageFile(file)`
Valida formatos: JPEG, PNG, GIF, WebP, BMP.

### `formatFileSize(bytes)`
Formatea tamaño para mostrar: "1.5 MB", "256 KB".

## Ejemplo de Componente

```tsx
import React, { useState } from 'react';
import { uploadImage, formatFileSize, imageToBase64WebP } from '../services/imageService';

export const ImageUploader: React.FC<{ onUpload: (url: string) => void }> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar preview
    const base64 = await imageToBase64WebP(file);
    setPreview(base64);

    // Subir
    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);

    if (result.success && result.imageUrl) {
      onUpload(result.imageUrl);
      alert(`Imagen subida. Ahorro: ${result.compressionRatio}%`);
    } else {
      alert(result.error || 'Error al subir');
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: 200 }} />}
      {uploading && <span>Subiendo...</span>}
    </div>
  );
};
```

## Comparación de Formatos

| Formato | Tamaño típico | Compresión |
|---------|---------------|------------|
| JPEG Original | 500 KB | - |
| JPEG Comprimido | 150 KB | 70% |
| **WebP (85%)** | **80 KB** | **84%** |
| WebP (70%) | 50 KB | 90% |

## Troubleshooting

### "Error al convertir imagen"
- Verifica que el navegador soporte Canvas API
- Asegúrate de que la imagen no esté corrupta

### "Error HTTP 413"
- El archivo excede 5MB
- Ajusta `MAX_FILE_SIZE` en `upload.php`

### "Error de CORS"
- Verifica headers en `upload.php`
- Asegúrate de que `UPLOAD_ENDPOINT` es correcto
