import bcrypt from "bcryptjs";
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
    const { name, email, password } = JSON.parse(event.body || "{}");

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          msg: "Name, email, and password are required"
        })
      };
    }

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ msg: "Email is already registered" })
      };
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name,
      email,
      password: hashed
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ msg: "User registered" })
    };
  } catch (err: any) {
    console.error("Registration function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Registration service is unavailable. Check the Netlify function logs."
      })
    };
  }
};
