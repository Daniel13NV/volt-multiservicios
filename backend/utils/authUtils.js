// backend/utils/authUtils.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Instale bcrypt: npm install bcrypt
if (bcrypt) {
    console.log('bcrypt instalado y listo para usar.');
}

// 1. Hashear Contraseña
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

// 2. Comparar Contraseña
exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};