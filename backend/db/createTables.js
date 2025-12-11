// backend/db/createTables.js
const { pool } = require('../config/db'); // Importe el pool de conexiones

// Definición de las sentencias SQL (DDL)
const tableQueries = [
    // 1. Tabla Clientes
    `CREATE TABLE IF NOT EXISTS Clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        direccion_envio TEXT,
        password VARCHAR(255) NOT NULL
    );`,
    // 2. Tabla Materiales
    `CREATE TABLE IF NOT EXISTS Materiales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL,
        descripcion TEXT,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        categoria VARCHAR(100),
        imagen_url VARCHAR(255)
    );`,
    // 3. Tabla Servicios
    `CREATE TABLE IF NOT EXISTS Servicios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT,
        tipo_servicio VARCHAR(100) NOT NULL,
        descripcion_problema TEXT,
        fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_programada DATE,
        estado VARCHAR(50) DEFAULT 'Pendiente',
        FOREIGN KEY (cliente_id) REFERENCES Clientes(id)
    );`,
    // 4. Tabla Pedidos
    `CREATE TABLE IF NOT EXISTS Pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT,
        fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado VARCHAR(50) DEFAULT 'Procesando',
        total DECIMAL(10, 2) NOT NULL,
        direccion_envio TEXT,
        FOREIGN KEY (cliente_id) REFERENCES Clientes(id)
    );`,
    // 5. Tabla DetallePedido
    `CREATE TABLE IF NOT EXISTS DetallePedido (
        pedido_id INT,
        material_id INT,
        cantidad INT NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (pedido_id, material_id),
        FOREIGN KEY (pedido_id) REFERENCES Pedidos(id),
        FOREIGN KEY (material_id) REFERENCES Materiales(id)
    );`
];

async function createTables() {
    console.log('Iniciando creación de tablas...');
    for (const query of tableQueries) {
        try {
            await pool.execute(query);
        } catch (error) {
            console.error('Error al crear una tabla:', error.message);
            return; 
        }
    }
    console.log('🎉 Todas las tablas creadas exitosamente.');
    pool.end(); // Cerrar el pool después de la creación
}

createTables();