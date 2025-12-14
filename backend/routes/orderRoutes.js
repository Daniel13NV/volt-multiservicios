// backend/routes/orderRoutes.js 

const express = require('express');
const router = express.Router();
const { getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Importar middleware

// Ruta para obtener pedidos del usuario autenticado: GET /api/orders/user
router.get('/user', protect, getUserOrders);

// Añadimos las otras rutas base que creamos para evitar el error 'Module Not Found'
router.get('/test', (req, res) => {
    res.send('Ruta de pedidos cargada.');
});

module.exports = router;