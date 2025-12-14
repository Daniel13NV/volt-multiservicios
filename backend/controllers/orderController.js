// backend/controllers/orderController.js (CONEXIÓN REAL A MySQL)

const { pool } = require('../config/db');

// @desc    Obtener todos los pedidos del usuario autenticado
// @route   GET /api/orders/user
// @access  Private
exports.getUserOrders = async (req, res) => {
    // req.user.id es establecido por el middleware 'protect' después de verificar el token
    const userId = req.user.id; 

    try {
        // Consulta real: Traer todos los pedidos del cliente, ordenados por fecha
        const query = 'SELECT * FROM Pedidos WHERE cliente_id = ? ORDER BY fecha_pedido DESC';
        const [rows] = await pool.execute(query, [userId]);
        
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos.' });
    }
};

// ... otras funciones de pedidos irían aquí (createOrder, getOrderById, etc.)