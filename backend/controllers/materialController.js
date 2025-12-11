// backend/controllers/materialController.js (COMPLETO)
const { pool } = require('../config/db');

// --- 1. Obtener Todos (GET) ---
exports.getAllMaterials = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, nombre, descripcion, precio_unitario, stock, categoria, imagen_url FROM Materiales');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al obtener el catálogo.' });
    }
};

// --- 2. Obtener por ID (GET) ---
exports.getMaterialById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT * FROM Materiales WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- 3. Crear (POST) ---
exports.createMaterial = async (req, res) => {
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url } = req.body;
    if (!nombre || !precio_unitario || !stock) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }
    try {
        const query = 'INSERT INTO Materiales (nombre, descripcion, precio_unitario, stock, categoria, imagen_url) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.execute(query, [nombre, descripcion, precio_unitario, stock, categoria, imagen_url]);
        res.status(201).json({ message: 'Material creado exitosamente.', materialId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- 4. Actualizar (PUT) ---
exports.updateMaterial = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url } = req.body;
    try {
        const query = 'UPDATE Materiales SET nombre=?, descripcion=?, precio_unitario=?, stock=?, categoria=?, imagen_url=? WHERE id=?';
        await pool.execute(query, [nombre, descripcion, precio_unitario, stock, categoria, imagen_url, id]);
        res.json({ message: 'Material actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- 5. Eliminar (DELETE) ---
exports.deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM Materiales WHERE id = ?', [id]);
        res.json({ message: 'Material eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};