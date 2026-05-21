const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando vaciado de base de datos...');
  
  // Limpiar tablas (en orden inverso de dependencia)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.design.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creando usuario administrador...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vectorstore.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Usuario administrador creado: ${admin.email}`);

  console.log('Creando categorías...');
  const catFutbol = await prisma.category.create({
    data: { name: 'Fútbol', slug: 'futbol', icon: '⚽' },
  });
  const catMotocross = await prisma.category.create({
    data: { name: 'Motocross', slug: 'motocross', icon: '🏍️' },
  });
  const catEsports = await prisma.category.create({
    data: { name: 'E-Sports', slug: 'esports', icon: '🎮' },
  });
  const catCasual = await prisma.category.create({
    data: { name: 'Casual', slug: 'casual', icon: '👕' },
  });

  console.log('Creando métodos de pago...');
  await prisma.paymentMethod.create({
    data: {
      name: 'Yape',
      type: 'qr',
      details: 'Escanea el código QR de Yape y envía el monto. Luego sube tu comprobante.',
      qrImageUrl: '/uploads/yape_qr.png', // Guardado local
      isActive: true,
    },
  });
  await prisma.paymentMethod.create({
    data: {
      name: 'Plin',
      type: 'qr',
      details: 'Escanea el código QR de Plin y envía el monto. Luego sube tu comprobante.',
      qrImageUrl: '/uploads/plin_qr.png',
      isActive: true,
    },
  });
  await prisma.paymentMethod.create({
    data: {
      name: 'PayPal',
      type: 'link',
      details: 'Haz clic en el enlace de pago de PayPal. Luego sube tu comprobante de confirmación.',
      linkUrl: 'https://paypal.me/vectorstore',
      isActive: true,
    },
  });

  console.log('Creando diseños semilla...');
  await prisma.design.create({
    data: {
      categoryId: catFutbol.id,
      name: 'Barcelona Champions 2026',
      slug: 'barcelona-champions-2026',
      description: 'Diseño inspirado en la camiseta del FC Barcelona campeón de La Liga 2026. Incluye patrones geométricos y degradados en azulgrana con detalles dorados.',
      pricePen: 25.00,
      pricePenDiscount: 20.00,
      priceUsd: 6.50,
      priceUsdDiscount: 4.90,
      imageUrl: '/mockups/jersey_1.png',
      gallery: JSON.stringify(['/mockups/jersey_1.png', '/mockups/jersey_2.png']),
      fileFormat: 'AI + PSD',
      isFree: false,
      megaUrl: 'https://mega.nz/file/dummy1#key_barcelona_champions',
    },
  });

  await prisma.design.create({
    data: {
      categoryId: catFutbol.id,
      name: 'Guerrero Textura Grunge',
      slug: 'guerrero-textura-grunge',
      description: 'Jersey con efecto textura grunge agresivo. Ideal para equipos que buscan un look competitivo y moderno.',
      pricePen: 18.00,
      pricePenDiscount: null,
      priceUsd: 4.80,
      priceUsdDiscount: null,
      imageUrl: '/mockups/jersey_2.png',
      gallery: JSON.stringify(['/mockups/jersey_2.png']),
      fileFormat: 'AI',
      isFree: false,
      megaUrl: 'https://mega.nz/file/dummy2#key_guerrero_grunge',
    },
  });

  await prisma.design.create({
    data: {
      categoryId: catEsports.id,
      name: 'Galaxy Purple Edition',
      slug: 'galaxy-purple-edition',
      description: 'Diseño futurista con gradientes púrpura y patrones triangulares. Perfecto para equipos modernos.',
      pricePen: 30.00,
      pricePenDiscount: 25.00,
      priceUsd: 8.00,
      priceUsdDiscount: 6.90,
      imageUrl: '/mockups/jersey_3.png',
      gallery: JSON.stringify(['/mockups/jersey_3.png']),
      fileFormat: 'AI + PSD + SVG',
      isFree: false,
      megaUrl: 'https://mega.nz/file/dummy3#key_galaxy_purple',
    },
  });

  await prisma.design.create({
    data: {
      categoryId: catMotocross.id,
      name: 'Military Camo Pro',
      slug: 'military-camo-pro',
      description: 'Camiseta con camuflaje militar moderno en tonos verdes. Diseño agresivo para equipos de alto rendimiento.',
      pricePen: 22.00,
      pricePenDiscount: null,
      priceUsd: 5.80,
      priceUsdDiscount: null,
      imageUrl: '/mockups/jersey_4.png',
      gallery: JSON.stringify(['/mockups/jersey_4.png']),
      fileFormat: 'AI',
      isFree: false,
      megaUrl: 'https://mega.nz/file/dummy4#key_military_camo',
    },
  });

  await prisma.design.create({
    data: {
      categoryId: catFutbol.id,
      name: 'Argentina Concept 2026',
      slug: 'argentina-concept-2026',
      description: 'Concepto de la camiseta de Argentina para el Mundial 2026. Diseño moderno con detalles dorados.',
      pricePen: 0.00,
      pricePenDiscount: null,
      priceUsd: 0.00,
      priceUsdDiscount: null,
      imageUrl: '/mockups/jersey_1.png',
      gallery: JSON.stringify(['/mockups/jersey_1.png']),
      fileFormat: 'AI',
      isFree: true,
      megaUrl: 'https://mega.nz/file/dummy5#key_argentina_free',
    },
  });

  console.log('Base de datos poblada exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
