// backend/server.js

// Cargar las variables de entorno al inicio
require('dotenv').config(); 

const express = require('express');
const app = express();
const port = 3001; // Puerto del backend
const cors = require('cors'); // <--- NUEVA IMPORTACIÓN
// =======================================================
// 1. IMPORTAR TODAS LAS RUTAS
// =======================================================

const materialRoutes = require('./routes/materialRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); 
const servicioRoutes = require('./routes/servicioRoutes'); 
const pedidoRoutes = require('./routes/pedidoRoutes'); 

// =======================================================
// 2. MIDDLEWARE
// =======================================================
const corsOptions = {
    // Permite al frontend (que correrá en 5173) acceder a la API
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions)); // <--- NUEVO MIDDLEWARE DE CORS

// Middleware para parsear JSON en el cuerpo de las peticiones (fundamental para POST/PUT)
app.use(express.json());

// NOTA: Se comenta testConnection() porque ya se verificó la conexión.
// const { testConnection } = require('./config/db'); 
// testConnection(); 

// =======================================================
// 3. CONECTAR RUTAS AL SERVIDOR
// =======================================================

// Rutas para la gestión de Inventario (CRUD)
app.use('/api/materiales', materialRoutes); 

// Rutas para Autenticación, Registro y Perfil de Clientes
app.use('/api/clientes', clienteRoutes); 

// Rutas para Solicitud y Gestión de Servicios (Leads)
app.use('/api/servicios', servicioRoutes); 

// Rutas para la Creación y Seguimiento de Pedidos (E-commerce)
app.use('/api/pedidos', pedidoRoutes); 

// =======================================================
// 4. PUNTO DE ENTRADA Y ESCUCHA
// =======================================================

// Ruta de Prueba para verificar que la API esté viva
app.get('/', (req, res) => {
    res.send('API de Volt Multiservicios funcionando! Endpoints disponibles en /api/...');
});

app.listen(port, () => {
    console.log(`Servidor de Volt Multiservicios escuchando en http://localhost:${port}`);
});