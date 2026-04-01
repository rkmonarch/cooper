import {
  pgTable,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(), // Phantom public key
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  // MoonPay OWS vault metadata (no keys stored here)
  owsVaultId: text("ows_vault_id"),
  // Spending policy stored as JSONB
  spendingPolicy: jsonb("spending_policy").$type<{
    dailyLimit: number;
    maxPerTransaction: number;
    allowedCategories: string[];
    requireApprovalAbove: number;
  }>(),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

// ─── Listings ─────────────────────────────────────────────────────────────────
export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  previewUrl: text("preview_url"),
  creatorAddress: text("creator_address").notNull(),
  creatorName: text("creator_name").notNull(),
  contentHash: text("content_hash").notNull(),
  content: text("content").notNull(), // revealed only after payment
  salesCount: integer("sales_count").default(0).notNull(),
  allowDownload: boolean("allow_download").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  buyerAddress: text("buyer_address").notNull(),
  // x402 fields
  txHash: text("tx_hash").notNull().unique(),
  network: text("network").notNull().default("base-sepolia"),
  amountUsdc: numeric("amount_usdc", { precision: 10, scale: 2 }).notNull(),
  usdcAddress: text("usdc_address").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  // OWS / agent metadata
  isAgent: boolean("is_agent").default(false).notNull(),
  agentGoal: text("agent_goal"),        // what the agent was trying to achieve
  policySnapshot: jsonb("policy_snapshot"), // policy at time of payment
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  approvedAt: timestamp("approved_at"), // null = auto-approved within policy
  // Status
  status: text("status").notNull().default("confirmed"), // confirmed | failed | refunded
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type ListingInsert = typeof listings.$inferInsert;
export type ListingSelect = typeof listings.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;
export type PaymentSelect = typeof payments.$inferSelect;
