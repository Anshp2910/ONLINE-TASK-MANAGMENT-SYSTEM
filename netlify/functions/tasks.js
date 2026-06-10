const mongoose = require("mongoose");
const connectDB = require("../lib/db");
const Task = require("../lib/models/Task");
const auth = require("../lib/authMiddleware");

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
};

function respond(statusCode, body) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(body)
    };
}

function getTaskId(event) {
    return event.path.split("/").filter(Boolean).pop();
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return respond(200, {});
    }

    try {
        const authResult = auth(event);
        if (authResult.error) {
            return respond(authResult.status, { msg: authResult.error });
        }

        await connectDB();

        const userId = authResult.user.id;

        if (event.httpMethod === "GET") {
            const tasks = await Task.find({ user: userId });
            return respond(200, tasks);
        }

        if (event.httpMethod === "POST") {
            const { title, desc, category } = JSON.parse(event.body || "{}");

            if (!title || !title.trim()) {
                return respond(400, { msg: "Task title is required" });
            }

            const task = new Task({
                title: title.trim(),
                desc: desc || "",
                category: category || "General",
                status: "pending",
                user: userId
            });

            await task.save();
            return respond(201, task);
        }

        if (event.httpMethod === "DELETE") {
            const id = getTaskId(event);

            if (!mongoose.isValidObjectId(id)) {
                return respond(400, { msg: "Invalid task ID" });
            }

            const deleted = await Task.findOneAndDelete({
                _id: id,
                user: userId
            });

            if (!deleted) {
                return respond(404, { msg: "Task not found" });
            }

            return respond(200, { msg: "Deleted" });
        }

        if (event.httpMethod === "PUT") {
            const id = getTaskId(event);

            if (!mongoose.isValidObjectId(id)) {
                return respond(400, { msg: "Invalid task ID" });
            }

            const body = JSON.parse(event.body || "{}");
            const updateData = {};

            for (const field of ["title", "desc", "category", "status"]) {
                if (body[field] !== undefined) {
                    updateData[field] = body[field];
                }
            }

            if (updateData.title !== undefined) {
                updateData.title = String(updateData.title).trim();
                if (!updateData.title) {
                    return respond(400, { msg: "Task title is required" });
                }
            }

            const updated = await Task.findOneAndUpdate(
                { _id: id, user: userId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updated) {
                return respond(404, { msg: "Task not found" });
            }

            return respond(200, updated);
        }

        return respond(405, { msg: "Method not allowed" });
    } catch (err) {
        console.error("Task function error:", err);

        if (err instanceof SyntaxError) {
            return respond(400, { msg: "Invalid JSON request body" });
        }

        const configurationError =
            err.message.includes("MONGO_URI is not configured");

        return respond(500, {
            msg: configurationError
                ? err.message
                : "Unable to process tasks. Check the Netlify function logs."
        });
    }
};
