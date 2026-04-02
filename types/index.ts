export type ListingCategory =
  | "ai-image"
  | "research"
  | "prompt"
  | "dataset"
  | "other";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number; // in USDC (e.g. 2.50)
  category: ListingCategory;
  previewUrl?: string;
  creatorAddress: string;
  creatorName: string;
  creatorUsername?: string | null;
  contentHash: string; // sha256 of content, used as payment reference
  allowDownload: boolean;
  createdAt: string;
  salesCount: number;
}

export interface Purchase {
  id: string;
  listingId: string;
  buyerAddress: string;
  txHash: string;
  amount: number;
  purchasedAt: string;
  isAgent: boolean;
}

export interface Policy {
  dailyLimit: number; // USDC
  maxPerTransaction: number; // USDC
  allowedCategories: ListingCategory[];
  requireApprovalAbove: number; // USDC – prompt for approval above this
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: "search" | "policy_check" | "approval_request" | "payment" | "unlock" | "error";
  message: string;
  data?: Record<string, unknown>;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
}
