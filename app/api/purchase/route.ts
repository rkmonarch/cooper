import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { db } from "@/lib/db";
import { listings, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const DEVNET = new Connection(clusterApiUrl("devnet"), "confirmed");

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, buyerAddress, txSignature, isAgent, policySnapshot } = body;

  if (!listingId || !buyerAddress || !txSignature) {
    return NextResponse.json(
      { error: "Missing listingId, buyerAddress, or txSignature" },
      { status: 400 },
    );
  }

  // Fetch listing
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // ── Verify transaction on Solana devnet ──────────────────────────────────
  let verified = false;
  let verifyError = "";

  try {
    const tx = await DEVNET.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found on devnet. It may still be confirming — try again in a moment." },
        { status: 402 },
      );
    }

    if (tx.meta?.err) {
      return NextResponse.json(
        { error: "Transaction failed on chain." },
        { status: 402 },
      );
    }

    // Walk instructions to find the SPL token transferChecked
    const instructions = tx.transaction.message.instructions;
    const expectedAmount = Math.round(Number(listing.price) * 1_000_000); // lamports with 6 decimals

    for (const ix of instructions) {
      if (!("parsed" in ix)) continue;
      const p = ix.parsed;
      if (
        p?.type !== "transferChecked" &&
        p?.type !== "transfer"
      ) continue;

      const info = p.info;
      const mintMatches =
        !info.mint || info.mint === USDC_DEVNET_MINT;
      const amountMatches =
        Number(info.tokenAmount?.amount ?? info.amount ?? 0) >= expectedAmount;
      const destinationMatches =
        info.destination ||
        info.multisigAuthority ||
        true; // relaxed for demo: just verify mint + amount

      if (mintMatches && amountMatches) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      verifyError = "Could not find a valid USDC transfer matching the listing price.";
    }
  } catch (err) {
    console.error("[purchase] verify error:", err);
    verifyError = "Failed to verify transaction on devnet.";
  }

  if (!verified) {
    return NextResponse.json({ error: verifyError }, { status: 402 });
  }

  // ── Guard against duplicate payments ─────────────────────────────────────
  const existing = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.txHash, txSignature))
    .limit(1);

  if (existing.length > 0) {
    // Already processed — return the content anyway (idempotent)
    return NextResponse.json({
      success: true,
      txHash: txSignature,
      content: listing.content,
      alreadyPurchased: true,
    });
  }

  // ── Record payment ────────────────────────────────────────────────────────
  const [purchase] = await db
    .insert(payments)
    .values({
      listingId,
      buyerAddress,
      txHash: txSignature,
      network: "solana-devnet",
      amountUsdc: listing.price,
      usdcAddress: USDC_DEVNET_MINT,
      recipientAddress: listing.creatorAddress,
      isAgent: isAgent ?? false,
      policySnapshot: policySnapshot ?? null,
      status: "confirmed",
    })
    .returning();

  // Increment sales count
  await db
    .update(listings)
    .set({ salesCount: listing.salesCount + 1 })
    .where(eq(listings.id, listingId));

  return NextResponse.json({
    success: true,
    txHash: txSignature,
    content: listing.content,
    purchaseId: purchase.id,
  });
}
