const jwt = require("jsonwebtoken");
require('dotenv').config();

// Create JWT
module.exports.createAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '4h' }); 
};

// Verify Token middleware
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ auth: "Failed. No Token" }); //  Standard 401 if no token

    token = token.startsWith("Bearer ") ? token.slice(7) : token;

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ auth: "Failed", message: err.message }); //  403 for invalid token
        req.user = decoded;
        next();
    });
};

// // Admin check middleware
// module.exports.verifyAdmin = (req, res, next) => {
//     if (req.user.isAdmin) return next();
//     return res.status(403).json({ auth: "Failed", message: "Action Forbidden" });
// };

// Error handler middleware
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: {
            message: err.message || "Internal Server Error",
            errorCode: err.code || "SERVER_ERROR",
            details: err.details || null
        }
    });
};
