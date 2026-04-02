CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"preview_url" text,
	"creator_address" text NOT NULL,
	"creator_name" text NOT NULL,
	"content_hash" text NOT NULL,
	"content" text NOT NULL,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"allow_download" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_address" text NOT NULL,
	"tx_hash" text NOT NULL,
	"network" text DEFAULT 'base-sepolia' NOT NULL,
	"amount_usdc" numeric(10, 2) NOT NULL,
	"usdc_address" text NOT NULL,
	"recipient_address" text NOT NULL,
	"is_agent" boolean DEFAULT false NOT NULL,
	"agent_goal" text,
	"policy_snapshot" jsonb,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"email" text,
	"ows_vault_id" text,
	"spending_policy" jsonb,
	"total_spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_ows_vault_id_unique" UNIQUE("ows_vault_id")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;