// backend/routes/pedidoRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrders } = require('../controllers/pedidoController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/pedidos - Crear nuevo pedido (Requiere autenticación de cliente)
router.post('/', protect, createOrder);

// GET /api/pedidos/:id - Seguimiento de pedido (Requiere autenticación)
router.get('/:id', protect, getOrderById);

// GET /api/pedidos - Obtener todos los pedidos (Ruta de Admin)
router.get('/', protect, admin, getOrders); // <--- RUTA PARA EL DASHBOARD

module.exports = router;