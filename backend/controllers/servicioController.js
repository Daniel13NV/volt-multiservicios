// backend/controllers/servicioController.js

const { pool } = require('../config/db');

// --- 1. Crear Solicitud de Servicio (POST /api/servicios) ---
exports.createServiceRequest = async (req, res) => {
    const cliente_id = req.user.id; 
    const { tipo_servicio, descripcion_problema, fecha_programada } = req.body; 

    if (!tipo_servicio || !descripcion_problema) {
        return res.status(400).json({ message: 'Tipo de servicio y descripción son obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO Servicios (cliente_id, tipo_servicio, descripcion_problema, fecha_programada)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [cliente_id, tipo_servicio, descripcion_problema, fecha_programada || null]);
        
        res.status(201).json({ 
            message: 'Solicitud de servicio registrada. Nos comunicaremos pronto.',
            serviceId: result.insertId
        });
    } catch (error) {
        console.error('Error al crear solicitud de servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la solicitud.' });
    }
};

// --- 2. Obtener Solicitudes Pendientes (GET /api/servicios/pendientes) - Solo Admin ---
exports.getPendingServices = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                s.id, s.tipo_servicio, s.descripcion_problema, s.estado, s.fecha_solicitud,
                c.nombre AS cliente_nombre, c.telefono, c.email
            FROM Servicios s
            LEFT JOIN Clientes c ON s.cliente_id = c.id
            WHERE s.estado IN ('Pendiente', 'Cotizando')
            ORDER BY s.fecha_solicitud ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios pendientes para admin:', error);
        res.status(500).json({ message: 'Error al obtener solicitudes pendientes.' });
    }
};

// --- 3. NUEVA FUNCIÓN: Actualizar Estado del Servicio (PUT /api/servicios/:id/estado) ---
exports.updateServiceStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; 

    if (!estado) {
        return res.status(400).json({ message: 'Se requiere el campo estado para la actualización.' });
    }

    try {
        const query = 'UPDATE Servicios SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [estado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        res.json({ message: `Estado del Servicio ${id} actualizado a ${estado}.` });
    } catch (error) {
        console.error('Error al actualizar estado del servicio:', error);
        res.status(500).json({ message: 'Error interno al actualizar el estado.' });
    }
};