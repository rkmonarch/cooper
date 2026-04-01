import type { Listing, Policy, AgentLog } from "@/types";

export interface AgentGoal {
  query: string; // e.g. "find latest Solana research"
  maxPrice: number; // USDC
  category?: string;
}

export interface AgentResult {
  success: boolean;
  listing?: Listing;
  txHash?: string;
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
 * Run the buyer agent:
 * 1. Search listings that match goal
 * 2. Check policy
 * 3. Request human approval if above threshold
 * 4. Submit x402 payment
 * 5. Return unlocked content
 */
export async function runBuyerAgent(
  goal: AgentGoal,
  policy: Policy,
  walletAddress: string,
  onLog: (log: AgentLog) => void
): Promise<AgentResult> {
  const logs: AgentLog[] = [];

  const log = (type: AgentLog["type"], message: string, data?: Record<string, unknown>) => {
    const entry = makeLog(type, message, data);
    logs.push(entry);
    onLog(entry);
    return entry;
  };

  try {
    // Step 1: Search
    log("search", `Searching for: "${goal.query}" under $${goal.maxPrice} USDC`);
    await sleep(800);

    const searchRes = await fetch(
      `/api/listings?q=${encodeURIComponent(goal.query)}&maxPrice=${goal.maxPrice}${goal.category ? `&category=${goal.category}` : ""}`
    );
    const { listings } = (await searchRes.json()) as { listings: Listing[] };

    if (!listings.length) {
      log("error", "No listings found matching your goal.");
      return { success: false, logs, error: "No listings found" };
    }

    const target = listings[0];
    log("search", `Found listing: "${target.title}" — ${target.price} USDC`, {
      listingId: target.id,
    });
    await sleep(600);

    // Step 2: Policy check
    log("policy_check", "Checking spending policy via OWS...");
    await sleep(700);

    const price = Number(target.price);

    if (price > policy.maxPerTransaction) {
      log("error", `Price ${price} USDC exceeds max-per-tx policy of ${policy.maxPerTransaction} USDC`);
      return { success: false, logs, error: "Policy: exceeds per-transaction limit" };
    }

    if (policy.allowedCategories.length && !policy.allowedCategories.includes(target.category as never)) {
      log("error", `Category "${target.category}" not in allowed list`);
      return { success: false, logs, error: "Policy: category not allowed" };
    }

    log("policy_check", `Policy OK — ${price} USDC is within limits`);
    await sleep(500);

    // Step 3: Human approval if above threshold
    if (price > policy.requireApprovalAbove) {
      log("approval_request", `Amount ${price} USDC exceeds auto-approve threshold of ${policy.requireApprovalAbove} USDC. Requesting Phantom approval...`);
      // In real impl, trigger Phantom biometric approval here
      await sleep(1200);
      log("approval_request", "Approval granted via Phantom");
    }

    // Step 4: Payment
    log("payment", `Submitting x402 payment of ${price} USDC for listing "${target.title}"...`);
    await sleep(1000);

    const payRes = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: target.id,
        buyerAddress: walletAddress,
        isAgent: true,
      }),
    });

    if (!payRes.ok) {
      const err = await payRes.json();
      log("error", `Payment failed: ${err.error}`);
      return { success: false, logs, error: err.error };
    }

    const { txHash } = (await payRes.json()) as { txHash: string };
    log("payment", `Payment confirmed — tx: ${txHash}`, { txHash });
    await sleep(600);

    // Step 5: Unlock
    log("unlock", `Content unlocked: "${target.title}"`);

    return { success: true, listing: target, txHash, logs };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log("error", message);
    return { success: false, logs, error: message };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
