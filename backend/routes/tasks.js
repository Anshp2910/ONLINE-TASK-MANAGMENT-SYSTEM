const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

// GET USER TASKS
router.get("/", auth, async (req, res) => {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
});

// ADD TASK
router.post("/", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        user: req.user.id
    });

    await task.save();
    res.json(task);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
    const updated = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updated);
});

module.exports = router;