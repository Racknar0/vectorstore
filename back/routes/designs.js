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

// GET /api/designs - Obtener catálogo público (OCULTA el campo megaUrl)
router.get('/', async (req, res) => {
  const { category, search, free, priceRange, sort } = req.query;

  try {
    const where = {};

    // Filtrar por categoría (slug)
    if (category && category !== 'all') {
      where.category = { slug: category };
    }

    // Filtros de búsqueda por texto
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filtrar gratis
    if (free === 'true') {
      where.isFree = true;
    }

    // Filtrar por rango de precios en Soles (PEN)
    if (priceRange) {
      if (priceRange === 'free') {
        where.isFree = true;
      } else if (priceRange === '0-15') {
        where.isFree = false;
        where.pricePen = { lte: 15 };
      } else if (priceRange === '15-30') {
        where.pricePen = { gt: 15, lte: 30 };
      } else if (priceRange === '30+') {
        where.pricePen = { gt: 30 };
      }
    }

    // Configurar ordenamiento
    let orderBy = { createdAt: 'desc' }; // Por defecto: más recientes
    if (sort === 'price-asc') {
      orderBy = { pricePen: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { pricePen: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { downloadCount: 'desc' };
    }

    // Hacemos el query EXCLUYENDO megaUrl por seguridad
    const designs = await prisma.design.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricePen: true,
        pricePenDiscount: true,
        priceUsd: true,
        priceUsdDiscount: true,
        imageUrl: true,
        gallery: true,
        fileFormat: true,
        isFree: true,
        downloadCount: true,
        categoryId: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Formatear galería a array
    const formatted = designs.map((d) => ({
      ...d,
      gallery: d.gallery ? JSON.parse(d.gallery) : [d.imageUrl],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar diseños:', error);
    res.status(500).json({ error: 'Error al obtener los diseños.' });
  }
});

// GET /api/designs/slug/:slug - Obtener detalle de un diseño por slug (OCULTA megaUrl)
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const design = await prisma.design.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricePen: true,
        pricePenDiscount: true,
        priceUsd: true,
        priceUsdDiscount: true,
        imageUrl: true,
        gallery: true,
        fileFormat: true,
        isFree: true,
        downloadCount: true,
        categoryId: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!design) {
      return res.status(404).json({ error: 'Diseño no encontrado.' });
    }

    const formatted = {
      ...design,
      gallery: design.gallery ? JSON.parse(design.gallery) : [design.imageUrl],
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error al obtener detalle del diseño:', error);
    res.status(500).json({ error: 'Error al recuperar el diseño.' });
  }
});

// GET /api/designs/admin - Obtener diseños para el panel admin (INCLUYE megaUrl para gestión)
router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const designs = await prisma.design.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = designs.map((d) => ({
      ...d,
      gallery: d.gallery ? JSON.parse(d.gallery) : [d.imageUrl],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar diseños en admin:', error);
    res.status(500).json({ error: 'Error al cargar diseños para el administrador.' });
  }
});

// POST /api/designs - Registrar diseño nuevo (Sólo Administrador)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const {
    categoryId,
    name,
    description,
    pricePen,
    pricePenDiscount,
    priceUsd,
    priceUsdDiscount,
    imageUrl,
    gallery, // Se espera un array de strings en el body
    fileFormat,
    isFree,
    megaUrl,
  } = req.body;

  if (!categoryId || !name || !imageUrl || !fileFormat || (!isFree && !pricePen && !priceUsd) || !megaUrl) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el diseño.' });
  }

  try {
    const slug = slugify(name);

    // Validar si existe el slug
    const existing = await prisma.design.findUnique({
      where: { slug },
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un diseño con este nombre.' });
    }

    const design = await prisma.design.create({
      data: {
        categoryId: parseInt(categoryId),
        name,
        slug,
        description,
        pricePen: parseFloat(pricePen || 0),
        pricePenDiscount: pricePenDiscount ? parseFloat(pricePenDiscount) : null,
        priceUsd: parseFloat(priceUsd || 0),
        priceUsdDiscount: priceUsdDiscount ? parseFloat(priceUsdDiscount) : null,
        imageUrl,
        gallery: gallery ? JSON.stringify(gallery) : null,
        fileFormat,
        isFree: !!isFree,
        megaUrl,
      },
    });

    res.status(201).json(design);
  } catch (error) {
    console.error('Error al crear diseño:', error);
    res.status(500).json({ error: 'Error al registrar el diseño.' });
  }
});

// PUT /api/designs/:id - Editar diseño (Sólo Administrador)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const dataToUpdate = {};
    if (data.categoryId) dataToUpdate.categoryId = parseInt(data.categoryId);
    if (data.name) {
      dataToUpdate.name = data.name;
      dataToUpdate.slug = slugify(data.name);
    }
    if (data.description !== undefined) dataToUpdate.description = data.description;
    if (data.pricePen !== undefined) dataToUpdate.pricePen = parseFloat(data.pricePen || 0);
    if (data.pricePenDiscount !== undefined) {
      dataToUpdate.pricePenDiscount = data.pricePenDiscount ? parseFloat(data.pricePenDiscount) : null;
    }
    if (data.priceUsd !== undefined) dataToUpdate.priceUsd = parseFloat(data.priceUsd || 0);
    if (data.priceUsdDiscount !== undefined) {
      dataToUpdate.priceUsdDiscount = data.priceUsdDiscount ? parseFloat(data.priceUsdDiscount) : null;
    }
    if (data.imageUrl) dataToUpdate.imageUrl = data.imageUrl;
    if (data.gallery) dataToUpdate.gallery = JSON.stringify(data.gallery);
    if (data.fileFormat) dataToUpdate.fileFormat = data.fileFormat;
    if (data.isFree !== undefined) dataToUpdate.isFree = !!data.isFree;
    if (data.megaUrl) dataToUpdate.megaUrl = data.megaUrl;

    const design = await prisma.design.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json(design);
  } catch (error) {
    console.error('Error al editar diseño:', error);
    res.status(500).json({ error: 'Error al actualizar el diseño.' });
  }
});

// DELETE /api/designs/:id - Eliminar diseño (Sólo Administrador)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si se ha vendido
    const salesCount = await prisma.orderItem.count({
      where: { designId: parseInt(id) },
    });

    if (salesCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este diseño porque ya ha sido comprado por clientes. Puedes deshabilitarlo o cambiar su precio.',
      });
    }

    await prisma.design.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Diseño eliminado correctamente.' });
  } catch (error) {
    console.error('Error al borrar diseño:', error);
    res.status(500).json({ error: 'Error al eliminar el diseño de la base de datos.' });
  }
});

module.exports = router;
