const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Auxiliar: Generar slug a partir del nombre
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET /api/tags - Obtener todas las etiquetas (público o admin)
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { designs: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Formatear para retornar count directamente
    const formatted = tags.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt,
      designCount: t._count.designs
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar etiquetas:', error);
    res.status(500).json({ error: 'Error al obtener las etiquetas.' });
  }
});

// POST /api/tags - Crear nueva etiqueta (Sólo Administrador)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la etiqueta es obligatorio.' });
  }

  try {
    const slug = slugify(name);

    // Validar si existe
    const existing = await prisma.tag.findUnique({
      where: { slug }
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una etiqueta con este nombre.' });
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    res.status(500).json({ error: 'Error al registrar la etiqueta.' });
  }
});

// DELETE /api/tags/:id - Eliminar etiqueta (Sólo Administrador)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Al ser relación muchos a muchos implícita, Prisma se encarga de eliminar las relaciones
    // en la tabla intermedia _DesignToTag automáticamente al eliminar la etiqueta.
    await prisma.tag.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Etiqueta eliminada correctamente.' });
  } catch (error) {
    console.error('Error al borrar etiqueta:', error);
    res.status(500).json({ error: 'Error al eliminar la etiqueta de la base de datos.' });
  }
});

// PUT /api/tags/:id - Editar etiqueta (Sólo Administrador)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la etiqueta es obligatorio.' });
  }

  try {
    const slug = slugify(name);

    // Validar si existe otra etiqueta con el mismo slug (que no sea la actual)
    const existing = await prisma.tag.findFirst({
      where: {
        slug,
        NOT: { id: parseInt(id) }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya existe otra etiqueta con este nombre.' });
    }

    const updatedTag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        slug
      }
    });

    res.json(updatedTag);
  } catch (error) {
    console.error('Error al editar etiqueta:', error);
    res.status(500).json({ error: 'Error al actualizar la etiqueta.' });
  }
});

module.exports = router;
