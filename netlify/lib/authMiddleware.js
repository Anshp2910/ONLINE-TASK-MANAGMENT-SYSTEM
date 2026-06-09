const jwt = require("jsonwebtoken");

module.exports = function(req) {
    const token = req.headers.authorization;

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
