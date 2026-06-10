const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error(
            "MONGO_URI is not configured. Add it in Netlify environment variables."
        );
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        }).catch((error) => {
            connectionPromise = null;
            throw error;
        });
    }

    try {
        await connectionPromise;
        return mongoose.connection;
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        throw err;
    }
}

module.exports = connectDB;
