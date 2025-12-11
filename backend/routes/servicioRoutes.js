// backend/routes/servicioRoutes.js

const express = require('express');
const router = express.Router();
const { createServiceRequest, getPendingServices, updateServiceStatus } = require('../controllers/servicioController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/servicios - Crear nueva solicitud (Requiere Login)
router.post('/', protect, createServiceRequest);

// GET /api/servicios/pendientes - Obtener leads pendientes (Ruta de Admin)
router.get('/pendientes', protect, admin, getPendingServices); 

// PUT /api/servicios/:id/estado - Actualizar estado del servicio (Ruta de Admin)
router.put('/:id/estado', protect, admin, updateServiceStatus); // <-- RUTA DE SEGUIMIENTO

module.exports = router;