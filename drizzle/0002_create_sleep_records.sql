CREATE TABLE "sleep_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sleep_method_id" uuid NOT NULL,
	"sleep_date" date NOT NULL,
	"slept_minutes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sleep_records" ADD CONSTRAINT "sleep_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sleep_records" ADD CONSTRAINT "sleep_records_sleep_method_id_sleep_methods_id_fk" FOREIGN KEY ("sleep_method_id") REFERENCES "public"."sleep_methods"("id") ON DELETE no action ON UPDATE no action;
