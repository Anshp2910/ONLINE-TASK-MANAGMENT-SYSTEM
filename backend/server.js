const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function startServer() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from backend/.env");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(port, () => console.log(`Server running on ${port}`));
}

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});
