const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

const authMiddleware = async (req, res, next) => {
    const rawToken = req.header('Authorization');

    if (!rawToken) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    // Acepta tanto "Bearer <token>" (Postman / estándar) como el JWT directo (legacy)
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    try {
        const decoded = jwt.verify(token, 'jwtSecret');
 
        // Verificar si el token está en la lista de tokens revocados
        const revokedToken = await RevokedToken.findOne({ token });
        if (revokedToken) {
            return res.status(401).json({ message: 'Token revocado' });
        }

        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: 'La sesión a expirado' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido:', error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;