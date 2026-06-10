const jwt = require("jsonwebtoken");

module.exports = function(req) {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");
        return {
            error: "Server authentication is not configured",
            status: 500
        };
    }

    const authorization = req.headers.authorization || req.headers.Authorization || "";
    const token = authorization.replace(/^Bearer\s+/i, "");

    if (!token) {
        return { error: "No token", status: 401 };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
    } catch {
        return { error: "Invalid token", status: 401 };
    }
};
