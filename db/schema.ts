import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  desc: text("desc").notNull().default(""),
  category: text("category").notNull().default("General"),
  status: text("status").notNull().default("pending"),
  userId: integer("user_id").notNull().references(() => users.id),
});
