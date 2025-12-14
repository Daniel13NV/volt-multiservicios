// backend/controllers/userController.js (LOGIN REAL CON MYSQL Y BCRYPT)

const { pool } = require('../config/db'); // Asume que tienes pool configurado
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Para generar tokens (Aunque uses un token dummy por ahora)

// Función para simular la generación de un token (AJUSTAR SEGÚN TU CLAVE SECRETA)
// En un proyecto real, usarías process.env.JWT_SECRET
const generateToken = (id) => {
    // Usaremos una clave secreta simple para que esto funcione
    const JWT_SECRET = 'miclavesecreta123'; 
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Autenticar un usuario / Iniciar Sesión
// @route   POST /api/clientes/login 
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body; 

    try {
        // 1. Buscar usuario por email
        const [rows] = await pool.execute('SELECT * FROM Clientes WHERE email = ?', [email]);
        const user = rows[0];

        if (user) {
            // 2. Comparar la contraseña ingresada con la contraseña hasheada en la BD
            // Asume que la columna de contraseña en tu tabla Clientes se llama 'password'
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // 3. Login Exitoso: Devolver datos y generar token
                res.json({
                    id: user.id,
                    userName: user.nombre, // Asumo que el nombre está en la columna 'nombre'
                    email: user.email,
                    isAdmin: user.isAdmin, // Asumo que tienes una columna 'isAdmin' (BOOLEAN)
                    token: generateToken(user.id),
                });
            } else {
                // Contraseña incorrecta
                res.status(401).json({ message: 'Credenciales inválidas (Contraseña).' });
            }
        } else {
            // Usuario no encontrado
            res.status(401).json({ message: 'Credenciales inválidas (Email).' });
        }

    } catch (error) {
        console.error('Error durante el proceso de login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};

// NOTA IMPORTANTE: Para que esto funcione, la contraseña de Daniel en la BD debe estar hasheada. 
// Si la contraseña de Daniel está en texto plano, necesitarás registrarla de nuevo usando bcrypt.