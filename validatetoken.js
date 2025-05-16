const jwt = require('jsonwebtoken');
require('dotenv').config();

function validateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    jwt.verify(token, process.env.JWT_KEY, (err) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        } else {
            next();
        }
        
    });
};

module.exports = validateToken;