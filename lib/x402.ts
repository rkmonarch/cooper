/**
 * x402 payment protocol helpers
 * Spec: https://github.com/coinbase/x402
 */

export interface X402PaymentPayload {
  scheme: "exact";
  network: "base" | "base-sepolia";
  maxAmountRequired: string; // in atomic units (USDC has 6 decimals)
  resource: string; // the URL being paid for
  description: string;
  mimeType: string;
  payTo: string; // recipient address
  requiredDeadlineSeconds: number;
  usdcAddress: string;
  extra?: Record<string, unknown>;
}

export interface X402Receipt {
  txHash: string;
  network: string;
  paidAt: string;
  amount: string;
}

// USDC on Base Sepolia (testnet)
export const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
// USDC on Base mainnet
export const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function usdcToAtomic(usdcAmount: number): string {
  return Math.round(usdcAmount * 1_000_000).toString();
}

export function atomicToUsdc(atomic: string): number {
  return parseInt(atomic) / 1_000_000;
}

/**
 * Build a 402 Payment Required response payload.
 * Called server-side when a locked resource is requested without payment.
 */
export function buildPaymentRequired(
  resource: string,
  priceUsdc: number,
  recipientAddress: string,
  description: string
): X402PaymentPayload {
  return {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: usdcToAtomic(priceUsdc),
    resource,
    description,
    mimeType: "application/json",
    payTo: recipientAddress,
    requiredDeadlineSeconds: 300, // 5 min window
    usdcAddress: USDC_ADDRESS_BASE_SEPOLIA,
  };
}

/**
 * Verify a payment receipt against the facilitator (server-side).
 */
export async function verifyPayment(
  txHash: string,
  expectedAmount: string,
  payTo: string
): Promise<boolean> {
  try {
    const facilitator = process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";
    const res = await fetch(`${facilitator}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash, expectedAmount, payTo, network: "base-sepolia" }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
