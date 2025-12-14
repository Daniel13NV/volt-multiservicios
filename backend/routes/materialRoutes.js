// backend/routes/materialRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getMaterials, 
    getAllMaterialsAdmin, 
    createMaterial, 
    updateMaterial, 
    getMaterialById
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- RUTAS PÚBLICAS Y GENERALES (deben ir al principio) ---

// 1. GET /api/materiales - Catálogo Público (sin proteger, soporta ?q=)
router.get('/', getMaterials); 

// 2. GET /api/materiales/admin - Obtener todos para el Dashboard (Ruta de Admin)
router.get('/admin', protect, admin, getAllMaterialsAdmin); 

// --- RUTA CON PARÁMETRO (debe ir al final para no 'atrapar' las anteriores) ---

// 3. GET /api/materiales/:id - Detalle de Material (PÚBLICO)
router.get('/:id', getMaterialById); 

// --- RUTAS DE ADMINISTRACIÓN RESTANTES ---

// 4. POST /api/materiales/admin - Crear nuevo material
router.post('/admin', protect, admin, createMaterial);

// 5. PUT /api/materiales/admin/:id - Actualizar material
router.put('/admin/:id', protect, admin, updateMaterial);

module.exports = router;