// backend/controllers/pedidoController.js

const { pool } = require('../config/db');

// --- 1. Crear Pedido (POST /api/pedidos) - LÓGICA DE INVENTARIO Y TRANSACCIÓN ---
exports.createOrder = async (req, res) => {
    // NOTA: req.user.id viene del middleware protect
    const { items, total, direccion_envio } = req.body;
    const cliente_id = req.user.id; // Usar el ID del usuario autenticado

    if (!cliente_id || !items || items.length === 0 || !total) {
        return res.status(400).json({ message: 'Faltan datos requeridos para el pedido.' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // <-- 1. INICIAR TRANSACCIÓN

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
            
            // Descontar el stock (UPDATE)
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
        await connection.commit(); // <-- 2. CONFIRMAR TRANSACCIÓN

        res.status(201).json({ message: 'Pedido creado exitosamente y stock actualizado.', pedidoId });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // <-- 3. DESHACER (ROLLBACK) SI FALLA
        }
        
        // Manejo de errores específicos para el cliente (stock)
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
    // ... (Esta función no necesita cambios críticos) ...
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
        
        // CORRECCIÓN CLAVE: Mapear para asegurar que 'total' sea un número
        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total) // Convertir el total a un float
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error al obtener pedidos para admin:', error);
        res.status(500).json({ message: 'Error al obtener la lista de pedidos.' });
    }
};