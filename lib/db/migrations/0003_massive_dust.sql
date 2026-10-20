CREATE TYPE "public"."inventory_category" AS ENUM('decoration', 'seed', 'special');--> statement-breakpoint
ALTER TYPE "public"."xp_transaction_reason" ADD VALUE 'seed_boost';--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "inventory_category" NOT NULL,
	"icon" text NOT NULL,
	"rarity" "achievement_rarity" DEFAULT 'common' NOT NULL,
	"places_as_tile_type" text,
	"seed_growth_boost_xp" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_inventory_user_item_unique" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "garden_tiles" ADD COLUMN "decoration_item_id" uuid;--> statement-breakpoint
ALTER TABLE "garden_tiles" ADD COLUMN "rotation" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_inventory_user_id_idx" ON "user_inventory" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "garden_tiles" ADD CONSTRAINT "garden_tiles_decoration_item_id_inventory_items_id_fk" FOREIGN KEY ("decoration_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;