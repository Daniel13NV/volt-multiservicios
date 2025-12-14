// backend/server.js (COMPLETO y CORREGIDO con Mapeo de Clientes)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- CLAVE: CONFIGURACIÓN DE CARPETA ESTÁTICA PARA IMÁGENES SUBIDAS ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rutas ---
const userRoutes = require('./routes/userRoutes');
const materialRoutes = require('./routes/materialRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

// --- CAMBIO CLAVE: Mapeamos /api/clientes a userRoutes ---
app.use('/api/clientes', userRoutes); // Esto resuelve el error 404 del login

app.use('/api/materiales', materialRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API está corriendo...');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));