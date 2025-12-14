// backend/routes/serviceRoutes.js 

const express = require('express');
const router = express.Router();
const { getUserServices } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware'); // Importar middleware

// Ruta para obtener servicios del usuario autenticado: GET /api/services/user
router.get('/user', protect, getUserServices);

// Añadimos las otras rutas base que creamos para evitar el error 'Module Not Found'
router.get('/test', (req, res) => {
    res.send('Ruta de servicios cargada.');
});

module.exports = router;