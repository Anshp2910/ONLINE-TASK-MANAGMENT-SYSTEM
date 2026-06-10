CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");