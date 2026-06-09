const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
    if (isConnected) {
        return mongoose.connection;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log("MongoDB Connected");
        return mongoose.connection;
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        throw err;
    }
}

module.exports = connectDB;
