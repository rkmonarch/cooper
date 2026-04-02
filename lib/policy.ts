import type { Policy, ListingCategory } from "@/types";

export const DEFAULT_POLICY: Policy = {
  dailyLimit: 50,
  maxPerTransaction: 10,
  allowedCategories: [],
  requireApprovalAbove: 5,
};

// ── localStorage keys ─────────────────────────────────────────────────────────

const POLICY_KEY = "cooper_policy";
const DAILY_SPEND_KEY = "cooper_daily_spend";

interface DailySpend {
  date: string; // YYYY-MM-DD
  total: number; // USDC
}

// ── Read / write helpers ──────────────────────────────────────────────────────

export function loadPolicy(): Policy {
  if (typeof window === "undefined") return DEFAULT_POLICY;
  try {
    const raw = localStorage.getItem(POLICY_KEY);
    return raw ? { ...DEFAULT_POLICY, ...JSON.parse(raw) } : DEFAULT_POLICY;
  } catch {
    return DEFAULT_POLICY;
  }
}

export function savePolicy(policy: Policy): void {
  localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getDailySpent(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(DAILY_SPEND_KEY);
    if (!raw) return 0;
    const record: DailySpend = JSON.parse(raw);
    return record.date === todayKey() ? record.total : 0;
  } catch {
    return 0;
  }
}

export function recordSpend(amount: number): void {
  const today = todayKey();
  const current = getDailySpent();
  const record: DailySpend = { date: today, total: current + amount };
  localStorage.setItem(DAILY_SPEND_KEY, JSON.stringify(record));
}

// ── Policy check result ───────────────────────────────────────────────────────

export type PolicyCheckResult =
  | { allowed: true;  requiresApproval: false }
  | { allowed: true;  requiresApproval: true }
  | { allowed: false; reason: string };

export function checkPolicy(
  price: number,
  category: ListingCategory,
  policy?: Policy,
): PolicyCheckResult {
  const p = policy ?? loadPolicy();
  const dailySpent = getDailySpent();

  // Category check — empty allowedCategories means all are allowed
  if (
    p.allowedCategories.length > 0 &&
    !p.allowedCategories.includes(category)
  ) {
    return {
      allowed: false,
      reason: `Category "${category}" is not in your allowed list.`,
    };
  }

  // Per-transaction limit
  if (price > p.maxPerTransaction) {
    return {
      allowed: false,
      reason: `Price ${price} USDC exceeds your per-tx limit of ${p.maxPerTransaction} USDC.`,
    };
  }

  // Daily limit
  if (dailySpent + price > p.dailyLimit) {
    return {
      allowed: false,
      reason: `This purchase would exceed your daily limit. Spent today: ${dailySpent.toFixed(2)} USDC / ${p.dailyLimit} USDC.`,
    };
  }

  // Needs approval if above threshold
  if (price >= p.requireApprovalAbove) {
    return { allowed: true, requiresApproval: true };
  }

  return { allowed: true, requiresApproval: false };
}
