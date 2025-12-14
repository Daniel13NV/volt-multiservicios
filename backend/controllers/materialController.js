// backend/controllers/materialController.js

const { pool } = require('../config/db');

// --- 1. Obtener Materiales (Público, con filtro/búsqueda) ---
exports.getMaterials = async (req, res) => {
    const { q } = req.query; 

    let query = 'SELECT * FROM Materiales WHERE stock > 0';
    let params = [];

    if (q) {
        const searchPattern = `%${q}%`;
        query += ' AND (nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY nombre ASC'; 

    try {
        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener materiales para catálogo:', error);
        res.status(500).json({ message: 'Error al cargar el catálogo de materiales.' });
    }
};

// --- 2. Obtener TODOS los Materiales (Admin) ---
exports.getAllMaterialsAdmin = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Materiales ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener todos los materiales para admin:', error);
        res.status(500).json({ message: 'Error al cargar la lista de materiales.' });
    }
};

// --- 3. Crear Material (Admin) ---
exports.createMaterial = async (req, res) => {
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url } = req.body;

    if (!nombre || !precio_unitario || !stock || !categoria) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, precio, stock y categoría.' });
    }

    try {
        const query = `
            INSERT INTO Materiales (nombre, descripcion, precio_unitario, stock, categoria, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [nombre, descripcion, precio_unitario, stock, categoria, imagen_url || null]);

        res.status(201).json({ 
            message: 'Material agregado exitosamente al inventario.', 
            materialId: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear nuevo material:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir el material.' });
    }
};

// --- 4. Actualizar Material (Admin) ---
exports.updateMaterial = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url } = req.body;

    if (!nombre || !precio_unitario || !stock || !categoria) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para la actualización.' });
    }

    try {
        const query = `
            UPDATE Materiales SET 
                nombre = ?, 
                descripcion = ?, 
                precio_unitario = ?, 
                stock = ?, 
                categoria = ?, 
                imagen_url = ?
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [
            nombre, 
            descripcion, 
            precio_unitario, 
            stock, 
            categoria, 
            imagen_url || null, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material no encontrado o sin cambios.' });
        }

        res.json({ message: `Material ID ${id} actualizado exitosamente.` });
    } catch (error) {
        console.error('Error al actualizar material:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el material.' });
    }
};

// --- 5. NUEVA FUNCIÓN: Obtener un Material por ID (GET /api/materiales/:id) - RUTA PÚBLICA
exports.getMaterialById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT * FROM Materiales WHERE id = ? AND stock > 0', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado o agotado.' });
        }
        
        // Asegurar que el precio sea float para el frontend
        const material = {
            ...rows[0],
            precio_unitario: parseFloat(rows[0].precio_unitario)
        };
        
        res.json(material);
    } catch (error) {
        console.error('Error al obtener material por ID:', error);
        res.status(500).json({ message: 'Error al cargar el detalle del material.' });
    }
};