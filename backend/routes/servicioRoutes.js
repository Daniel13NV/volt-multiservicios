// backend/routes/servicioRoutes.js

const express = require('express');
const router = express.Router();
const { createServiceRequest, getPendingServices } = require('../controllers/servicioController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/servicios - Crear nueva solicitud (AHORA REQUIERE AUTENTICACIÓN)
// El middleware 'protect' valida el token y añade req.user.id
router.post('/', protect, createServiceRequest); // <--- CORRECCIÓN CLAVE

// GET /api/servicios/pendientes - Obtener leads pendientes (Ruta de Admin)
router.get('/pendientes', protect, admin, getPendingServices); 

module.exports = router;