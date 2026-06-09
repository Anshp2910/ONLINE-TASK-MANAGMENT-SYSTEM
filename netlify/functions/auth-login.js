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
        const { email, password } = JSON.parse(event.body);

        const user = await User.findOne({ email });
        if (!user) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ msg: "User not found" })
            };
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ msg: "Wrong password" })
            };
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message })
        };
    }
};
