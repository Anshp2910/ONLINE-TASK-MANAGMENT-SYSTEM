const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("../lib/db");
const User = require("../lib/models/User");

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
    }

    try {
        await connectDB();
        const { name, email, password } = JSON.parse(event.body || "{}");

        if (!name || !email || !password) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    msg: "Name, email, and password are required"
                })
            };
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                statusCode: 409,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ msg: "Email is already registered" })
            };
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed });
        await user.save();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ msg: "User registered" })
        };
    } catch (err) {
        console.error("Registration function error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                error: err.message.includes("MONGO_URI is not configured")
                    ? err.message
                    : "Registration service is unavailable. Check the Netlify function logs."
            })
        };
    }
};
