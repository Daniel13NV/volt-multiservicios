// backend/controllers/materialController.js (COMPLETO y CORREGIDO - Subida/Soft Delete)

const { pool } = require('../config/db');

// @desc    Obtener materiales del catálogo (Público, con filtro opcional)
// @route   GET /api/materiales?q=query
// @access  Public
exports.getMaterials = async (req, res) => {
    const { q } = req.query; 

    try {
        let query = 'SELECT * FROM Materiales WHERE stock > 0 AND activo = 1'; 
        let params = [];

        if (q) {
            query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }
        
        const [rows] = await pool.execute(query, params);
        res.json(rows);

    } catch (error) {
        console.error("Error al obtener materiales:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// @desc    Obtener todos los materiales (incluidos agotados e inactivos) para Admin
// @route   GET /api/materiales/admin
// @access  Private/Admin
exports.getAllMaterialsAdmin = async (req, res) => {
    try {
        const query = 'SELECT * FROM Materiales'; 
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener todos los materiales:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// @desc    Obtener un material por ID (Público)
// @route   GET /api/materiales/:id
// @access  Public
exports.getMaterialById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM Materiales WHERE id = ? AND activo = 1'; 
        const [rows] = await pool.execute(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado o inactivo.' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener material por ID:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// @desc    Crear un nuevo material (CON SUBIDA DE IMAGEN MULTER)
// @route   POST /api/materiales/admin
// @access  Private/Admin
exports.createMaterial = async (req, res) => {
    
    let urlPublicaImagen = null; 
    
    const { nombre, descripcion, precio_unitario, stock, categoria } = req.body;

    // --- CORRECCIÓN CLAVE: EXTRAER URL PÚBLICA DE MULTER ---
    if (req.file) {
        const fileName = req.file.filename; 
        urlPublicaImagen = `uploads/${fileName}`; // Guarda la ruta que es accesible por /uploads/
    }
    // --------------------------------------------------------

    if (!nombre || !precio_unitario || !stock || !categoria) {
        return res.status(400).json({ message: 'Faltan campos obligatorios en el formulario.' });
    }

    try {
        const query = `INSERT INTO Materiales (nombre, descripcion, precio_unitario, stock, categoria, imagen_url, activo) 
                       VALUES (?, ?, ?, ?, ?, ?, 1)`;
        
        const [result] = await pool.execute(query, [nombre, descripcion, precio_unitario, stock, categoria, urlPublicaImagen, 1]); 

        res.status(201).json({ 
            id: result.insertId, 
            nombre, 
            imagen_url: urlPublicaImagen, 
            message: 'Material creado exitosamente.' 
        });
    } catch (error) {
        console.error("Error al crear material:", error);
        res.status(500).json({ message: 'Error interno al crear material. El problema puede persistir si la conexión a la DB falla o el archivo es inválido.' });
    }
};


// @desc    Actualizar un material existente (incluye reactivación si se envía 'activo')
// @route   PUT /api/materiales/admin/:id
// @access  Private/Admin
exports.updateMaterial = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock, categoria, imagen_url, activo } = req.body; 

    if (!nombre || !precio_unitario || !stock || !categoria) {
         if (activo !== undefined) {
             try {
                const updateActiveQuery = `UPDATE Materiales SET activo = ? WHERE id = ?`;
                await pool.execute(updateActiveQuery, [activo, id]);
                return res.json({ message: `Material ID ${id} estado activo actualizado.` });
            } catch (error) {
                console.error("Error al actualizar solo el estado activo:", error);
                return res.status(500).json({ message: 'Error interno al actualizar solo el estado activo.' });
            }
        }
        return res.status(400).json({ message: 'Faltan campos obligatorios para la actualización.' });
    }

    try {
        const query = `UPDATE Materiales SET nombre = ?, descripcion = ?, precio_unitario = ?, stock = ?, categoria = ?, imagen_url = ?, activo = ?
                       WHERE id = ?`;
        
        const finalActivo = activo === undefined ? 1 : activo; 

        const [result] = await pool.execute(query, [nombre, descripcion, precio_unitario, stock, categoria, imagen_url, finalActivo, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material no encontrado para actualizar.' });
        }

        res.json({ message: `Material ID ${id} actualizado exitosamente.` });
    } catch (error) {
        console.error("Error al actualizar material:", error);
        res.status(500).json({ message: 'Error interno al actualizar material.' });
    }
};


// @desc    Inactivar/Eliminar Lógicamente un Material (Soft Delete)
// @route   DELETE /api/materiales/admin/:id
// @access  Private/Admin
exports.deleteMaterial = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'UPDATE Materiales SET activo = 0 WHERE id = ?'; 
        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material no encontrado.' });
        }

        res.json({ message: `Material ID ${id} marcado como inactivo (Soft Delete) exitosamente.` });
    } catch (error) {
        console.error('Error al inactivar material:', error);
        res.status(500).json({ message: 'Error interno al inactivar el material.' });
    }
};