const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ msg: "Name, email, and password are required" });
        }

        const trimmedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(409).json({ msg: "Email is already registered" });
        }

        const hashed = await bcrypt.hash(password.trim(), 10);

        const user = new User({
            name: name.trim(),
            email: trimmedEmail,
            password: hashed
        });
        await user.save();

        res.json({ msg: "User registered" });
    } catch (error) {
        console.error("Register route error:", error);
        res.status(500).json({ msg: "Internal server error during registration" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || !email.trim() || !password.trim()) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const trimmedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        const match = await bcrypt.compare(password.trim(), user.password);
        if (!match) {
            return res.status(400).json({ msg: "Wrong password" });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment variables");
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        );

        res.json({ token });
    } catch (error) {
        console.error("Login route error:", error);
        res.status(500).json({ msg: "Internal server error during login" });
    }
});

module.exports = router;