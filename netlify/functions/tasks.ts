import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tasks } from "../../db/schema.js";
import auth from "../lib/authMiddleware.js";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
};

function respond(statusCode: number, body: any) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(body)
    };
}

function getTaskId(event: any) {
    return event.path.split("/").filter(Boolean).pop();
}

export const handler = async (event: any) => {
    if (event.httpMethod === "OPTIONS") {
        return respond(200, {});
    }

    try {
        const authResult = auth(event);
        if (authResult.error || !authResult.user) {
            return respond(authResult.status || 401, { msg: authResult.error || "Unauthorized" });
        }

        const userId = authResult.user.id;

        if (event.httpMethod === "GET") {
            const taskList = await db.select().from(tasks).where(eq(tasks.userId, userId));
            const mappedTasks = taskList.map(t => ({
                _id: t.id.toString(),
                title: t.title,
                desc: t.desc,
                category: t.category,
                status: t.status,
                user: t.userId.toString()
            }));
            return respond(200, mappedTasks);
        }

        if (event.httpMethod === "POST") {
            const { title, desc, category } = JSON.parse(event.body || "{}");

            if (!title || !title.trim()) {
                return respond(400, { msg: "Task title is required" });
            }

            const [inserted] = await db.insert(tasks).values({
                title: title.trim(),
                desc: desc || "",
                category: category || "General",
                status: "pending",
                userId: userId
            }).returning();

            const mappedInserted = {
                _id: inserted.id.toString(),
                title: inserted.title,
                desc: inserted.desc,
                category: inserted.category,
                status: inserted.status,
                user: inserted.userId.toString()
            };

            return respond(201, mappedInserted);
        }

        if (event.httpMethod === "DELETE") {
            const id = getTaskId(event);
            const taskId = parseInt(id, 10);

            if (isNaN(taskId)) {
                return respond(400, { msg: "Invalid task ID" });
            }

            const deleted = await db.delete(tasks).where(
                and(
                    eq(tasks.id, taskId),
                    eq(tasks.userId, userId)
                )
            ).returning();

            if (deleted.length === 0) {
                return respond(404, { msg: "Task not found" });
            }

            return respond(200, { msg: "Deleted" });
        }

        if (event.httpMethod === "PUT") {
            const id = getTaskId(event);
            const taskId = parseInt(id, 10);

            if (isNaN(taskId)) {
                return respond(400, { msg: "Invalid task ID" });
            }

            const body = JSON.parse(event.body || "{}");
            const updateData: any = {};

            if (body.title !== undefined) {
                updateData.title = String(body.title).trim();
                if (!updateData.title) {
                    return respond(400, { msg: "Task title is required" });
                }
            }
            if (body.desc !== undefined) {
                updateData.desc = body.desc;
            }
            if (body.category !== undefined) {
                updateData.category = body.category;
            }
            if (body.status !== undefined) {
                updateData.status = body.status;
            }

            let updatedList;
            if (Object.keys(updateData).length > 0) {
                updatedList = await db.update(tasks).set(updateData).where(
                    and(
                        eq(tasks.id, taskId),
                        eq(tasks.userId, userId)
                    )
                ).returning();
            } else {
                updatedList = await db.select().from(tasks).where(
                    and(
                        eq(tasks.id, taskId),
                        eq(tasks.userId, userId)
                    )
                );
            }

            if (updatedList.length === 0) {
                return respond(404, { msg: "Task not found" });
            }

            const updated = updatedList[0];
            const mappedUpdated = {
                _id: updated.id.toString(),
                title: updated.title,
                desc: updated.desc,
                category: updated.category,
                status: updated.status,
                user: updated.userId.toString()
            };

            return respond(200, mappedUpdated);
        }

        return respond(405, { msg: "Method not allowed" });
    } catch (err: any) {
        console.error("Task function error:", err);

        if (err instanceof SyntaxError) {
            return respond(400, { msg: "Invalid JSON request body" });
        }

        return respond(500, {
            msg: "Unable to process tasks. Check the Netlify function logs."
        });
    }
};
