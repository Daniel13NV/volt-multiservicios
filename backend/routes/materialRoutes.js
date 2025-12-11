// backend/routes/materialRoutes.js (ACTUALIZADO)
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware'); // Importar Middleware

// Rutas Públicas (Catálogo E-commerce)
router.get('/', materialController.getAllMaterials);
router.get('/:id', materialController.getMaterialById);

// Rutas Privadas (Administrador de Inventario)
router.post('/', protect, admin, materialController.createMaterial);
router.put('/:id', protect, admin, materialController.updateMaterial);
router.delete('/:id', protect, admin, materialController.deleteMaterial);

module.exports = router;