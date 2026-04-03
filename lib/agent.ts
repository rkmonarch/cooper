import type { Listing, Policy, AgentLog } from "@/types";

export interface AgentGoal {
  query: string;
  maxPrice: number;
  category?: string;
}

export interface AgentResult {
  success: boolean;
  listing?: Listing;
  txHash?: string;
  content?: string;
  logs: AgentLog[];
  error?: string;
}

function makeLog(
  type: AgentLog["type"],
  message: string,
  data?: Record<string, unknown>
): AgentLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
  };
}

/**
 * Run the buyer agent end-to-end:
 * 1. Search listings matching goal + budget
 * 2. Check spending policy
 * 3. Request approval if above threshold
 * 4. POST /api/pay — builds tx, signs via OWS signer, broadcasts on Solana devnet
 * 5. Return unlocked content
 */
export async function runBuyerAgent(
  goal: AgentGoal,
  policy: Policy,
  walletAddress: string,
  onLog: (log: AgentLog) => void,
  userId?: string,
): Promise<AgentResult> {
  const logs: AgentLog[] = [];

  const log = (type: AgentLog["type"], message: string, data?: Record<string, unknown>) => {
    const entry = makeLog(type, message, data);
    logs.push(entry);
    onLog(entry);
    return entry;
  };

  try {
    // ── Step 1: Search ────────────────────────────────────────────────────────
    const categoryLabel = goal.category ? ` in "${goal.category}"` : "";
    log("search", `Searching for: "${goal.query}"${categoryLabel} under $${goal.maxPrice} USDC`);

    // Use category + price to search — do NOT pass the raw goal text as a title
    // query because it's natural language and won't match listing titles.
    const params = new URLSearchParams({
      maxPrice: String(goal.maxPrice),
      sort: "most_bought",
    });
    if (goal.category) params.set("category", goal.category);

    const searchRes = await fetch(`/api/listings?${params}`);
    const { listings } = (await searchRes.json()) as { listings: Listing[] };

    if (!listings?.length) {
      log("error", "No listings found matching your goal.");
      return { success: false, logs, error: "No listings found" };
    }

    const target = listings[0];
    log("search", `Found: "${target.title}" — ${target.price} USDC`, { listingId: target.id });

    // ── Step 2: Policy check ──────────────────────────────────────────────────
    log("policy_check", "Checking spending policy via OWS…");

    const price = Number(target.price);

    if (price > policy.maxPerTransaction) {
      log("error", `Price ${price} USDC exceeds per-tx limit of ${policy.maxPerTransaction} USDC`);
      return { success: false, logs, error: "Policy: exceeds per-transaction limit" };
    }

    if (policy.allowedCategories.length && !policy.allowedCategories.includes(target.category as never)) {
      log("error", `Category "${target.category}" not in your allowed list`);
      return { success: false, logs, error: "Policy: category not allowed" };
    }

    log("policy_check", `Policy OK — ${price} USDC is within limits`);

    // ── Step 3: Approval gate ────────────────────────────────────────────────
    if (price > policy.requireApprovalAbove) {
      log("approval_request", `${price} USDC exceeds auto-approve threshold (${policy.requireApprovalAbove} USDC) — auto-approved by agent policy`);
    }

    // ── Step 4: Payment via /api/pay ─────────────────────────────────────────
    log("payment", `Signing + broadcasting USDC payment of ${price} USDC…`);

    if (!userId) {
      log("error", "No userId — agent cannot sign without a wallet session.");
      return { success: false, logs, error: "Not authenticated" };
    }

    const payRes = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: target.id,
        userId,
        walletAddress,
        isAgent: true,
        policySnapshot: policy,
      }),
    });

    const payData = await payRes.json();

    if (!payRes.ok) {
      log("error", `Payment failed: ${payData.error}`);
      return { success: false, logs, error: payData.error };
    }

    log("payment", `Payment confirmed — tx: ${payData.txHash}`, { txHash: payData.txHash });

    // ── Step 5: Unlock ───────────────────────────────────────────────────────
    log("unlock", `Content unlocked: "${target.title}"`);

    return {
      success: true,
      listing: target,
      txHash: payData.txHash,
      content: payData.content,
      logs,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log("error", message);
    return { success: false, logs, error: message };
  }
}
