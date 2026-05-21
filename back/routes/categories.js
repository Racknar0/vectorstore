const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Auxiliar: Generar slug a partir de un texto
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Reemplazar espacios con -
    .replace(/[^\w\-]+/g, '')       // Eliminar caracteres no alfanuméricos
    .replace(/\-\-+/g, '-');        // Reemplazar múltiples -
}

// GET /api/categories - Obtener todas las categorías con conteo de diseños
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { designs: true },
        },
      },
    });

    // Formatear la respuesta para que coincida con el frontend
    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      count: cat._count.designs,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

// POST /api/categories - Crear categoría (Sólo Administrador)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, icon } = req.body;

  if (!name || !icon) {
    return res.status(400).json({ error: 'El nombre y el icono son obligatorios.' });
  }

  try {
    const slug = slugify(name);

    // Verificar si ya existe el slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una categoría con un nombre similar.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al registrar la categoría.' });
  }
});

// PUT /api/categories/:id - Editar categoría (Sólo Administrador)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;

  try {
    const dataToUpdate = {};
    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = slugify(name);
    }
    if (icon) dataToUpdate.icon = icon;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json(category);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al modificar la categoría.' });
  }
});

// DELETE /api/categories/:id - Eliminar categoría (Sólo Administrador)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si tiene diseños asociados
    const designsCount = await prisma.design.count({
      where: { categoryId: parseInt(id) },
    });

    if (designsCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque contiene diseños asociados. Elimina los diseños primero.',
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Categoría eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al borrar la categoría.' });
  }
});

module.exports = router;
