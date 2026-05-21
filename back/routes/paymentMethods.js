const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/payment-methods - Listar métodos de pago activos (Público)
router.get('/', async (req, res) => {
  try {
    const list = await prisma.paymentMethod.findMany({
      where: { isActive: true },
    });
    res.json(list);
  } catch (error) {
    console.error('Error al listar métodos de pago:', error);
    res.status(500).json({ error: 'Error al obtener métodos de pago.' });
  }
});

// GET /api/payment-methods/admin - Listar todos para el administrador
router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const list = await prisma.paymentMethod.findMany();
    res.json(list);
  } catch (error) {
    console.error('Error al cargar métodos de pago en admin:', error);
    res.status(500).json({ error: 'Error al cargar métodos de pago.' });
  }
});

// POST /api/payment-methods - Crear método de pago (Administrador)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, type, details, qrImageUrl, linkUrl, isActive } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'El nombre y tipo son obligatorios.' });
  }

  try {
    const pm = await prisma.paymentMethod.create({
      data: {
        name,
        type,
        details,
        qrImageUrl,
        linkUrl,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });
    res.status(201).json(pm);
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    res.status(500).json({ error: 'Error al guardar el método de pago.' });
  }
});

// PUT /api/payment-methods/:id - Editar método de pago (Administrador)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.details !== undefined) updateData.details = data.details;
    if (data.qrImageUrl !== undefined) updateData.qrImageUrl = data.qrImageUrl;
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.isActive !== undefined) updateData.isActive = !!data.isActive;

    const pm = await prisma.paymentMethod.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(pm);
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    res.status(500).json({ error: 'Error al editar el método de pago.' });
  }
});

// DELETE /api/payment-methods/:id - Eliminar método de pago (Administrador)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si se ha usado en órdenes
    const ordersCount = await prisma.order.count({
      where: { paymentMethodId: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este método de pago porque ya se ha utilizado en compras. Puedes desactivarlo (isActive = false).',
      });
    }

    await prisma.paymentMethod.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Método de pago eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ error: 'Error al borrar el método de pago.' });
  }
});

module.exports = router;
