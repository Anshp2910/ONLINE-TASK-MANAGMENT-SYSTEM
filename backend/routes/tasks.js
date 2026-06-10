const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

// GET USER TASKS
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (error) {
        console.error("GET tasks route error:", error);
        res.status(500).json({ msg: "Internal server error retrieving tasks" });
    }
});

// ADD TASK
router.post("/", auth, async (req, res) => {
    try {
        const { title, desc, category } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ msg: "Task title is required" });
        }

        const task = new Task({
            title: title.trim(),
            desc: desc || "",
            category: category || "General",
            status: "pending",
            user: req.user.id
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error("POST task route error:", error);
        res.status(500).json({ msg: "Internal server error adding task" });
    }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ msg: "Invalid task ID" });
        }

        const deleted = await Task.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!deleted) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.json({ msg: "Deleted" });
    } catch (error) {
        console.error("DELETE task route error:", error);
        res.status(500).json({ msg: "Internal server error deleting task" });
    }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ msg: "Invalid task ID" });
        }

        const { title, desc, category, status } = req.body;
        const updateData = {};

        if (title !== undefined) {
            updateData.title = String(title).trim();
            if (!updateData.title) {
                return res.status(400).json({ msg: "Task title is required" });
            }
        }
        if (desc !== undefined) updateData.desc = desc;
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) updateData.status = status;

        const updated = await Task.findOneAndUpdate(
            { _id: id, user: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.json(updated);
    } catch (error) {
        console.error("PUT task route error:", error);
        res.status(500).json({ msg: "Internal server error updating task" });
    }
});

module.exports = router;