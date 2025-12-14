// backend/routes/materialRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getMaterials, 
    getAllMaterialsAdmin, 
    createMaterial, 
    updateMaterial, 
    getMaterialById // <-- IMPORTADO
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET /api/materiales/:id - Detalle de Material (PÚBLICO)
router.get('/:id', getMaterialById); // <-- RUTA PÚBLICA

// 2. GET /api/materiales - Catálogo Público (sin proteger)
router.get('/', getMaterials); 

// --- RUTAS DE ADMINISTRACIÓN (PROTEGIDAS) ---

// 3. GET /api/materiales/admin - Obtener todos para el Dashboard
router.get('/admin', protect, admin, getAllMaterialsAdmin); 

// 4. POST /api/materiales/admin - Crear nuevo material
router.post('/admin', protect, admin, createMaterial);

// 5. PUT /api/materiales/admin/:id - Actualizar material
router.put('/admin/:id', protect, admin, updateMaterial);

module.exports = router;