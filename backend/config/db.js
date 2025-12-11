// backend/config/db.js
const mysql = require('mysql2/promise'); // Usamos la versión con promesas

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos MySQL.');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        // Salir del proceso si la conexión falla
        process.exit(1);
    }
}

// Exportar la función de prueba y el objeto 'pool'
module.exports = {
    pool,
    testConnection
};