// backend/middleware/authMiddleware.js (CÓDIGO COMPLETO)

exports.protect = (req, res, next) => {
    const authorizationHeader = req.headers.authorization; 

    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const tokenValue = authorizationHeader.split(' ')[1]; // Obtiene "User-5"
        
        if (tokenValue) {
            const tokenParts = tokenValue.split('-'); // Divide en ["User", "5"]
            
            if (tokenParts.length === 2) {
                const role = tokenParts[0].toLowerCase(); // 'user'
                const userId = parseInt(tokenParts[1]); // ID numérico
                
                if (!isNaN(userId) && userId > 0) {
                    // Si el ID es 1, lo consideramos administrador
                    const calculatedRole = userId === 1 ? 'admin' : role; 
                    
                    req.user = { 
                        id: userId, 
                        role: calculatedRole 
                    };
                    return next(); // Autenticación exitosa
                }
            }
        }
    } 
    
    return res.status(401).json({ message: 'No autorizado, token no proporcionado o inválido.' });
};

exports.admin = (req, res, next) => {
    // Verifica si el usuario autenticado tiene el rol 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // Devuelve 403 (Prohibido) si no es admin
        return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador.' });
    }
};