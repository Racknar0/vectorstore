const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuración del almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para evitar colisiones: voucher-17182901283-nombreOriginal.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'voucher-' + uniqueSuffix + ext);
  },
});

// Filtro de tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se admiten JPG, JPEG, PNG y PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
});

// POST /api/upload - Subir un comprobante
router.post('/', (req, res) => {
  upload.single('voucher')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Error de Multer (ej: límite de tamaño superado)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido de 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Otro error
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    // Retornar la URL relativa del archivo guardado
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Archivo subido correctamente.',
      fileUrl: fileUrl,
    });
  });
});

module.exports = router;
