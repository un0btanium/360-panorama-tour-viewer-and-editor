const ENV = require('../constants');
const jwt = require('jsonwebtoken');

// used to protect backend route (user needs to be logged in and have required role)
module.exports = (req, res, next, allowedRoles) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, ENV.JWT_KEY);
        // req.tokenData = decoded;
        if(!decoded.role || (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(decoded.role) === -1) ) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};