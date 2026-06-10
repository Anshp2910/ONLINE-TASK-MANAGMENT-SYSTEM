import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
}

export interface AuthResult {
  user?: AuthUser;
  error?: string;
  status?: number;
}

export default function auth(req: any): AuthResult {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return {
      error: "Server authentication is not configured",
      status: 500,
    };
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { error: "No token", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    return { user: { id: Number(decoded.id) } };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}
