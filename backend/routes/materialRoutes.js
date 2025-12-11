// backend/routes/materialRoutes.js

const express = require('express');
const router = express.Router();
const { getMaterials, getAllMaterialsAdmin, createMaterial, updateMaterial } = require('../controllers/materialController'); 
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET /api/materiales - Catálogo Público (sin proteger)
router.get('/', getMaterials); 

// --- RUTAS DE ADMINISTRACIÓN (PROTEGIDAS) ---

// 2. GET /api/materiales/admin - Obtener todos para el Dashboard
router.get('/admin', protect, admin, getAllMaterialsAdmin); 

// 3. POST /api/materiales/admin - Crear nuevo material
router.post('/admin', protect, admin, createMaterial);

// 4. PUT /api/materiales/admin/:id - Actualizar material
router.put('/admin/:id', protect, admin, updateMaterial); // <-- NUEVA RUTA DE EDICIÓN

module.exports = router;