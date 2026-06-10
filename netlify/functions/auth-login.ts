import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

export const handler = async (event: any) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not configured. Add it in Netlify environment variables."
      );
    }

    const { email, password } = JSON.parse(event.body || "{}");

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ msg: "Email and password are required" })
      };
    }

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ msg: "User not found" })
      };
    }

    const user = userList[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ msg: "Wrong password" })
      };
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token })
    };
  } catch (err: any) {
    console.error("Login function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err.message.includes("is not configured")
          ? err.message
          : "Login service is unavailable. Check the Netlify function logs."
      })
    };
  }
};
