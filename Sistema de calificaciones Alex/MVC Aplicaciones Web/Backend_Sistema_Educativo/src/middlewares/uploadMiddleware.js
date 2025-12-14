import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpetas si no existen
const publicDir = path.join(__dirname, '../../public');
const uploadDir = path.join(publicDir, 'uploads');

console.log('Public dir:', publicDir);
console.log('Upload dir:', uploadDir);

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✓ Carpeta public creada');
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Carpeta uploads creada');
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Guardando archivo en:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = 'foto-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Nombre archivo:', newFilename);
    cb(null, newFilename);
  }
});

// Filtro de tipos permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  console.log('🖼️  MIME type:', file.mimetype);
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

export default upload;
