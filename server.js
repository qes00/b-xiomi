import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde dist
// Nota: en cPanel la carpeta puede llamarse diferente, pero usaremos dist por defecto
app.use(express.static(path.join(dirname, 'dist')));

// Manejar SPA routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(dirname, 'dist', 'index.html'));
});

// En entornos como cPanel (Passenger), a veces es mejor no especificar el puerto si ellos lo manejan,
// pero process.env.PORT es el estándar. xd
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
