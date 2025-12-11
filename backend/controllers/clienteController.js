// backend/controllers/clienteController.js (CORREGIDO Y FINALIZADO)

const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/authUtils');
// NOTA: En un proyecto real, generaríamos un JWT aquí.

// --- 1. Registrar Cliente (POST /api/clientes/registro) ---
exports.registerClient = async (req, res) => {
    // Asignación de null si no se envían los campos opcionales
    const { 
        nombre, 
        email, 
        password,
        apellido = null, 
        telefono = null, 
        direccion_envio = null 
    } = req.body;

    if (!email || !password || !nombre) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, email y password.' });
    }

    try {
        const hashedPassword = await hashPassword(password);
        
        const query = 'INSERT INTO Clientes (nombre, apellido, email, telefono, direccion_envio, password) VALUES (?, ?, ?, ?, ?, ?)';
        
        const [result] = await pool.execute(query, [
            nombre, 
            apellido, 
            email, 
            telefono, 
            direccion_envio, 
            hashedPassword
        ]);
        
        res.status(201).json({ 
            message: 'Registro exitoso. Ahora puedes iniciar sesión.', 
            clientId: result.insertId, 
            email: email 
        });
    } catch (error) {
        console.error('Error durante el registro:', error); 
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

// --- 2. Iniciar Sesión (POST /api/clientes/login) ---
exports.loginClient = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT id, password, nombre FROM Clientes WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const client = rows[0];
        const isMatch = await comparePassword(password, client.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Éxito: Enviar un token simulado con el ID del cliente
        res.json({ 
            message: 'Inicio de sesión exitoso.', 
            clientId: client.id, 
            userName: client.nombre,
            token: `Bearer User-${client.id}` // Token simulado con el ID
        });

    } catch (error) {
        console.error('Error durante el login:', error); 
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};

// --- 3. Obtener Perfil (GET /api/clientes/perfil) ---
exports.getClientProfile = async (req, res) => {
    // req.user.id es asignado por el middleware (authMiddleware.js)
    const clientId = req.user.id; 
    try {
        const [rows] = await pool.execute('SELECT id, nombre, email, telefono, direccion_envio FROM Clientes WHERE id = ?', [clientId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Perfil no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el perfil:', error); 
        res.status(500).json({ message: 'Error al obtener el perfil.' });
    }
};