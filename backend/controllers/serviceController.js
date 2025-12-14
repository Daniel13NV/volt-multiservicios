// backend/controllers/serviceController.js (CONEXIÓN REAL A MySQL)

const { pool } = require('../config/db');

// @desc    Obtener todas las solicitudes de servicio del usuario autenticado
// @route   GET /api/services/user
// @access  Private
exports.getUserServices = async (req, res) => {
    // req.user.id es establecido por el middleware 'protect'
    const userId = req.user.id; 

    try {
        // Consulta real: Traer todas las solicitudes de servicio del cliente, ordenadas por fecha
        const query = 'SELECT * FROM Servicios WHERE cliente_id = ? ORDER BY fecha_solicitud DESC';
        const [rows] = await pool.execute(query, [userId]);
        
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener servicios del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener servicios.' });
    }
};

// ... otras funciones de servicios irían aquí (createService, updateService, etc.)