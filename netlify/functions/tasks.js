const connectDB = require("../lib/db");
const Task = require("../lib/models/Task");
const auth = require("../lib/authMiddleware");

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
        
        // Authenticate user
        const authResult = auth(event);
        if (authResult.error) {
            return {
                statusCode: authResult.status,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ msg: authResult.error })
            };
        }

        const userId = authResult.user.id;

        if (event.httpMethod === "GET") {
            // GET all user tasks
            const tasks = await Task.find({ user: userId });
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tasks)
            };
        }

        if (event.httpMethod === "POST") {
            // ADD task
            const { title, desc, category, status } = JSON.parse(event.body);
            const task = new Task({
                title,
                desc,
                category: category || 'General',
                status: status || 'pending',
                user: userId
            });
            await task.save();
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(task)
            };
        }

        if (event.httpMethod === "DELETE") {
            // DELETE task
            const id = event.path.split('/').pop();
            await Task.findByIdAndDelete(id);
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ msg: "Deleted" })
            };
        }

        if (event.httpMethod === "PUT") {
            // UPDATE task
            const id = event.path.split('/').pop();
            const updateData = JSON.parse(event.body);
            const updated = await Task.findByIdAndUpdate(id, updateData, { new: true });
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updated)
            };
        }

    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message })
        };
    }
};
