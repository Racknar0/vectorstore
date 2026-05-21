const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { sendDownloadsEmail } = require('../helpers/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/orders - Crear un nuevo pedido (Público, al hacer Checkout)
router.post('/', async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    paymentMethodId,
    paymentReceiptUrl,
    paymentReferenceId,
    items, // Array de IDs de diseños, ej: [1, 3]
  } = req.body;

  if (!customerName || !customerEmail || !paymentMethodId || !items || !items.length) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para crear el pedido.' });
  }

  try {
    // 1. Obtener los diseños de la base de datos para validar existencia y precios reales
    const designs = await prisma.design.findMany({
      where: {
        id: { in: items.map(id => parseInt(id)) },
      },
    });

    if (designs.length !== items.length) {
      return res.status(400).json({ error: 'Uno o más diseños seleccionados no existen en la base de datos.' });
    }

    // 2. Calcular los totales en base a los precios reales (con descuento si aplica)
    let totalPen = 0;
    let totalUsd = 0;

    const orderItemsData = designs.map((design) => {
      const pricePen = design.pricePenDiscount !== null ? design.pricePenDiscount : design.pricePen;
      const priceUsd = design.priceUsdDiscount !== null ? design.priceUsdDiscount : design.priceUsd;
      
      totalPen += pricePen;
      totalUsd += priceUsd;

      return {
        designId: design.id,
        pricePen,
        priceUsd,
      };
    });

    // 3. Generar un código único de orden legible (Ej: ORD-20260521-827)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatorios
    const orderCode = `ORD-${dateStr}-${randomSuffix}`;

    // 4. Crear la transacción en la base de datos para asegurar integridad
    const order = await prisma.$transaction(async (tx) => {
      // Crear la orden de compra
      const newOrder = await tx.order.create({
        data: {
          paymentMethodId: parseInt(paymentMethodId),
          orderCode,
          customerName,
          customerEmail,
          customerPhone,
          paymentReceiptUrl,
          paymentReferenceId,
          totalPen,
          totalUsd,
          status: 'PENDING',
        },
      });

      // Crear los detalles de los productos comprados
      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId: newOrder.id,
          designId: item.designId,
          pricePen: item.pricePen,
          priceUsd: item.priceUsd,
        })),
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Pedido registrado exitosamente.',
      orderCode: order.orderCode,
      status: order.status,
    });
  } catch (error) {
    console.error('Error al registrar pedido:', error);
    res.status(500).json({ error: 'Hubo un error al registrar el pedido.' });
  }
});

// GET /api/orders - Listar todos los pedidos para el panel (Administrador)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        paymentMethod: true,
        orderItems: {
          include: {
            design: {
              select: { name: true, fileFormat: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatear para simplificar el mapeo en el frontend
    const formatted = orders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      totalAmount: o.totalPen, // Para el dashboard por defecto
      totalPen: o.totalPen,
      totalUsd: o.totalUsd,
      paymentMethod: o.paymentMethod.name,
      paymentReceiptUrl: o.paymentReceiptUrl,
      paymentReferenceId: o.paymentReferenceId,
      status: o.status,
      rejectionReason: o.rejectionReason,
      createdAt: o.createdAt,
      items: o.orderItems.map((item) => ({
        designName: item.design.name,
        unitPrice: item.pricePen,
        fileFormat: item.design.fileFormat,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    res.status(500).json({ error: 'Error al cargar los pedidos.' });
  }
});

// GET /api/orders/kpis - Obtener KPIs y datos de gráficos para el Dashboard Admin (Administrador)
router.get('/kpis', authenticateToken, isAdmin, async (req, res) => {
  try {
    // 1. Obtener todas las órdenes completadas para sumas financieras
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
    });

    // 2. Calcular ventas totales
    const salesTotalPen = completedOrders.reduce((sum, o) => sum + o.totalPen, 0);
    
    // 3. Ventas de hoy
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = completedOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === todayStr);
    const salesTodayPen = todayOrders.reduce((sum, o) => sum + o.totalPen, 0);

    // 4. Pedidos pendientes
    const pendingOrdersCount = await prisma.order.count({
      where: { status: 'PENDING' },
    });

    // 5. Diseños totales
    const designsCount = await prisma.design.count();

    // 6. Generar datos del gráfico de últimos 7 días (ventas en soles)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      const dayOrders = completedOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === dateStr);
      const dayTotal = dayOrders.reduce((sum, o) => sum + o.totalPen, 0);
      
      // Obtener nombre del día
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      chartData.push({
        day: dayNames[d.getDay()],
        value: dayTotal,
      });
    }

    res.json({
      salesToday: `S/ ${salesTodayPen.toFixed(2)}`,
      salesMonth: `S/ ${salesTotalPen.toFixed(2)}`,
      pendingOrders: pendingOrdersCount,
      totalDesigns: designsCount,
      chartData,
    });
  } catch (error) {
    console.error('Error al generar KPIs:', error);
    res.status(500).json({ error: 'Error al generar indicadores financieros.' });
  }
});

// PATCH /api/orders/:id - Aprobar o Rechazar pedido (Administrador)
router.patch('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body; // status: 'COMPLETED' o 'REJECTED'

  if (!status || !['COMPLETED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'El nuevo estado debe ser COMPLETED o REJECTED.' });
  }

  try {
    // 1. Obtener los detalles actuales de la orden
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            design: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: `Este pedido ya se encuentra en estado: ${order.status}` });
    }

    // 2. Actualizar estado
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    });

    // 3. Acciones si es APROBADO: Enviar email automático y sumar contador de descargas
    if (status === 'COMPLETED') {
      const itemsForEmail = [];

      for (const item of order.orderItems) {
        // Añadir a lista de descargas para correo
        itemsForEmail.push({
          name: item.design.name,
          fileFormat: item.design.fileFormat,
          megaUrl: item.design.megaUrl,
        });

        // Sumar descarga al diseño
        await prisma.design.update({
          where: { id: item.designId },
          data: { downloadCount: { increment: 1 } },
        });
      }

      // Enviar correo de confirmación con enlaces
      try {
        console.log(`Enviando correo de descarga a: ${order.customerEmail}`);
        await sendDownloadsEmail(
          order.customerEmail,
          order.customerName,
          order.orderCode,
          itemsForEmail
        );
        console.log('Correo enviado exitosamente.');
      } catch (emailError) {
        console.error('Error al enviar el correo con los enlaces:', emailError);
        // No cancelamos el request por error de email, pero lo registramos
      }
    }

    res.json({
      message: `El pedido fue ${status === 'COMPLETED' ? 'aprobado' : 'rechazado'} exitosamente.`,
      status: updatedOrder.status,
    });
  } catch (error) {
    console.error('Error al modificar estado de orden:', error);
    res.status(500).json({ error: 'Error al cambiar estado del pedido.' });
  }
});

module.exports = router;
