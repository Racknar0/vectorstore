require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS para permitir peticiones del frontend (por defecto puerto 3000)
app.use(cors({
  origin: '*', // Permitir todas las conexiones en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurar que la carpeta para guardar los comprobantes subidos exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir la carpeta de comprobantes subidos de manera pública
// Ejemplo: http://localhost:5000/uploads/comprobante.png
app.use('/uploads', express.static(uploadsDir));

// Servir la carpeta de mockups de manera pública
// Ejemplo: http://localhost:5000/mockups/jersey_1.png
const mockupsDir = path.join(__dirname, 'mockups');
if (!fs.existsSync(mockupsDir)) {
  fs.mkdirSync(mockupsDir, { recursive: true });
}
app.use('/mockups', express.static(mockupsDir));

// Importar Rutas
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const designRoutes = require('./routes/designs');
const paymentMethodRoutes = require('./routes/paymentMethods');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');

// Registrar Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta de salud de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor API de VectorStore en ejecución' });
});

// Lanzar servidor
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor API corriendo en puerto: ${PORT}`);
  console.log(` URL base de la API: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});
