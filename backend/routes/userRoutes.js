// backend/routes/userRoutes.js (FINAL con LOGIN)

const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/userController'); // Importar la función

// RUTA DE LOGIN: Mapeado a /api/clientes/login en server.js
router.post('/login', loginUser);

// Ruta de prueba inicial
router.get('/test', (req, res) => {
    res.send('Ruta de usuarios funcionando.');
});

module.exports = router;