// backend/controllers/pedidoController.js

const { pool } = require('../config/db');

// --- 1. Crear Pedido (POST /api/pedidos) ---
exports.createOrder = async (req, res) => {
    const { items, total, direccion_envio } = req.body;
    const cliente_id = req.user.id; 

    if (!cliente_id || !items || items.length === 0 || !total) {
        return res.status(400).json({ message: 'Faltan datos requeridos para el pedido.' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); 

        // A. Verificar y Descontar el Stock
        for (const item of items) {
            const [materialRows] = await connection.execute('SELECT stock, nombre FROM Materiales WHERE id = ?', [item.material_id]);
            
            if (materialRows.length === 0) {
                throw new Error(`Material con ID ${item.material_id} no encontrado.`);
            }
            
            const currentStock = materialRows[0].stock;
            const requiredQuantity = item.cantidad;

            if (currentStock < requiredQuantity) {
                throw new Error(`Stock insuficiente para ${materialRows[0].nombre}. Disponible: ${currentStock}, Solicitado: ${requiredQuantity}.`);
            }
            
            await connection.execute(
                'UPDATE Materiales SET stock = stock - ? WHERE id = ?', 
                [requiredQuantity, item.material_id]
            );
        }

        // B. Insertar el Pedido (Encabezado)
        const orderQuery = 'INSERT INTO Pedidos (cliente_id, total, direccion_envio) VALUES (?, ?, ?)';
        const [orderResult] = await connection.execute(orderQuery, [cliente_id, total, direccion_envio]);
        const pedidoId = orderResult.insertId;

        // C. Insertar DetallePedido
        const detailQueries = items.map(item => {
            return connection.execute(
                'INSERT INTO DetallePedido (pedido_id, material_id, cantidad, precio_venta) VALUES (?, ?, ?, ?)',
                [pedidoId, item.material_id, item.cantidad, item.precio_venta]
            );
        });

        await Promise.all(detailQueries);
        await connection.commit(); 

        res.status(201).json({ message: 'Pedido creado exitosamente y stock actualizado.', pedidoId });

    } catch (error) {
        if (connection) {
            await connection.rollback(); 
        }
        
        if (error.message.includes('Stock insuficiente') || error.message.includes('no encontrado')) {
             return res.status(400).json({ message: error.message });
        }
        
        console.error('Error al procesar el pedido:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al procesar la compra.' });
        
    } finally {
        if (connection) connection.release();
    }
};

// --- 2. Obtener Pedido por ID (GET /api/pedidos/:id) ---
exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.id AS pedido_id, p.fecha_pedido, p.estado, p.total, p.direccion_envio, 
                m.nombre AS material_nombre, dp.cantidad, dp.precio_venta 
            FROM Pedidos p
            JOIN DetallePedido dp ON p.id = dp.pedido_id
            JOIN Materiales m ON dp.material_id = m.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los detalles del pedido por ID:', error);
        res.status(500).json({ message: 'Error al obtener los detalles del pedido.' });
    }
};

// --- 3. Obtener Todos los Pedidos (GET /api/pedidos) - Solo Admin ---
exports.getOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.total, p.fecha_pedido, p.estado,
                c.nombre AS cliente_nombre, c.email AS cliente_email
            FROM Pedidos p
            LEFT JOIN Clientes c ON p.cliente_id = c.id
            ORDER BY p.fecha_pedido DESC`;
            
        const [orders] = await pool.execute(query);
        
        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total)
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error al obtener pedidos para admin:', error);
        res.status(500).json({ message: 'Error al obtener la lista de pedidos.' });
    }
};

// --- 4. Actualizar Estado del Pedido (PUT /api/pedidos/:id/estado) ---
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; 

    if (!estado) {
        return res.status(400).json({ message: 'Se requiere el campo estado para la actualización.' });
    }

    try {
        const query = 'UPDATE Pedidos SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [estado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        res.json({ message: `Estado del Pedido ${id} actualizado a ${estado}.` });
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ message: 'Error interno al actualizar el estado.' });
    }
};

// --- 5. NUEVA FUNCIÓN: Obtener Pedidos por Cliente (GET /api/pedidos/mi-historial) ---
exports.getUserOrders = async (req, res) => {
    const cliente_id = req.user.id; 

    try {
        const query = `
            SELECT 
                p.id, p.total, p.fecha_pedido, p.estado
            FROM Pedidos p
            WHERE p.cliente_id = ?
            ORDER BY p.fecha_pedido DESC`;
            
        const [orders] = await pool.execute(query, [cliente_id]);
        
        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total)
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error al obtener historial de pedidos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener el historial de compras.' });
    }
};