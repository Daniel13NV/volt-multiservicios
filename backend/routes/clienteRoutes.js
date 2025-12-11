// backend/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/registro', clienteController.registerClient);
router.post('/login', clienteController.loginClient);

// Ruta protegida para que solo el cliente logueado pueda ver su perfil
router.get('/perfil', protect, clienteController.getClientProfile); 

module.exports = router;