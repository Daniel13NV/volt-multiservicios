// backend/server.js (COMPLETO y CORREGIDO)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Importar path para manejar rutas de archivos

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' })); // Permite la conexión desde el frontend
app.use(express.json()); // Permite aceptar datos JSON
app.use(express.urlencoded({ extended: true })); // Permite aceptar datos de formulario (url-encoded)

// --- CLAVE: CONFIGURACIÓN DE CARPETA ESTÁTICA PARA IMÁGENES SUBIDAS ---
// Esto permite que el frontend acceda a las imágenes en http://localhost:3001/uploads/nombre-de-imagen.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rutas ---
const userRoutes = require('./routes/userRoutes');
const materialRoutes = require('./routes/materialRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API está corriendo...');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));