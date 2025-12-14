// backend/routes/materialRoutes.js (ACTUALIZADO para subir imagen)

const express = require('express');
const router = express.Router();
const { 
    getMaterials, 
    getAllMaterialsAdmin, 
    createMaterial, 
    updateMaterial, 
    getMaterialById,
    deleteMaterial
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadMaterialImage } = require('../middleware/uploadMiddleware'); 

// --- RUTAS PÚBLICAS Y GENERALES ---

router.get('/', getMaterials); // CLAVE: Llama a la función que ahora está correctamente definida
router.get('/admin', protect, admin, getAllMaterialsAdmin); 
router.get('/:id', getMaterialById); 

// --- RUTAS DE ADMINISTRACIÓN ---

// 4. POST /api/materiales/admin - Crear nuevo material
router.post('/admin', protect, admin, uploadMaterialImage, createMaterial);

// 5. PUT /api/materiales/admin/:id - Actualizar material
router.put('/admin/:id', protect, admin, updateMaterial);

// 6. DELETE /api/materiales/admin/:id - Inactivar material (Soft Delete)
router.delete('/admin/:id', protect, admin, deleteMaterial); 

module.exports = router;