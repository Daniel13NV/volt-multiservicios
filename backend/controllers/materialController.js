// backend/controllers/materialController.js

const { pool } = require('../config/db');

// --- 1. Obtener Materiales (Público) ---
exports.getMaterials = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Materiales WHERE stock > 0');
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

// --- 4. NUEVA FUNCIÓN: Actualizar Material (Admin) ---
exports.updateMaterial = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url } = req.body;

    // Validación básica
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