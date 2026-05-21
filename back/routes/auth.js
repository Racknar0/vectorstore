const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'vector_store_super_secret_session_token_key_2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
  }

  try {
    // Buscar al usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' } // Expira en 7 días
    );

    // Retornar datos
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Hubo un error al procesar el inicio de sesión.' });
  }
});

// GET /api/auth/me (Verificar sesión actual)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: 'Error al recuperar la información de sesión.' });
  }
});

module.exports = router;
