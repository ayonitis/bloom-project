CREATE TYPE "public"."coin_transaction_reason" AS ENUM('daily_first_completion', 'perfect_day_bonus', 'achievement_reward', 'purchase');--> statement-breakpoint
CREATE TABLE "coin_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" "coin_transaction_reason" NOT NULL,
	"reference_date" text,
	"achievement_id" uuid,
	"item_id" uuid,
	"quantity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coin_transactions_user_date_reason_unique" UNIQUE("user_id","reference_date","reason")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "reward_coins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "price_coins" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bloom_coins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coin_transactions_user_id_idx" ON "coin_transactions" USING btree ("user_id");