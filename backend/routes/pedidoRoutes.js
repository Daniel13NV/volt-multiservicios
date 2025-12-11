// backend/routes/pedidoRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrders, updateOrderStatus } = require('../controllers/pedidoController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/pedidos - Crear nuevo pedido 
router.post('/', protect, createOrder);

// GET /api/pedidos/:id - Seguimiento de pedido
router.get('/:id', protect, getOrderById);

// GET /api/pedidos - Obtener todos los pedidos (Ruta de Admin)
router.get('/', protect, admin, getOrders); 

// PUT /api/pedidos/:id/estado - Actualizar estado del pedido (Ruta de Admin)
router.put('/:id/estado', protect, admin, updateOrderStatus); // <-- RUTA DE SEGUIMIENTO

module.exports = router;