import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, payments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { remoteSign } from "@/lib/signer-client";
import { buildUsdcTransferTx, preflightCheck, DEVNET_CONNECTION } from "@/lib/solana-payment";

export const dynamic = "force-dynamic";

/**
 * POST /api/pay
 * Body: { listingId: string, userId: string }
 *
 * Signs the USDC payment via OWS, broadcasts manually with skipPreflight
 * to avoid BlockhashNotFound simulation errors across devnet RPC nodes.
 */
export async function POST(req: NextRequest) {
  const { listingId, userId, walletAddress } = await req.json();

  if (!listingId || !userId) {
    return NextResponse.json({ error: "Missing listingId or userId" }, { status: 400 });
  }

  if (!walletAddress) {
    return NextResponse.json({ error: "Missing wallet address. Please sign out and sign in again." }, { status: 400 });
  }
  const buyerAddress: string = walletAddress;

  // Look up the owsVaultId stored in DB for this wallet address.
  // This is the exact vault name used when the wallet was originally created —
  // avoids any userId format mismatch (Google sub vs UUID etc).
  const [userRow] = await db
    .select({ owsVaultId: users.owsVaultId })
    .from(users)
    .where(eq(users.walletAddress, buyerAddress))
    .limit(1);

  if (!userRow?.owsVaultId) {
    return NextResponse.json({ error: "Vault ID not found. Please sign out and sign in again." }, { status: 400 });
  }
  const vaultId = userRow.owsVaultId;

  // Fetch listing
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const recipient = listing.creatorAddress;
  if (!recipient || recipient === "anonymous") {
    return NextResponse.json({ error: "Listing has no creator address" }, { status: 400 });
  }

  let txSignature: string;
  try {
    // Preflight: verify buyer has enough SOL + USDC before touching the chain
    await preflightCheck(buyerAddress, recipient, Number(listing.price));

    // Build unsigned tx (fetches fresh blockhash from DEVNET_CONNECTION)
    const tx = await buildUsdcTransferTx(buyerAddress, recipient, Number(listing.price));

    // Sign via the remote signer server (ngrok locally, Railway in prod)
    const signedTx = await remoteSign(vaultId, tx);

    // Broadcast via our own connection with skipPreflight=true so we're
    // not subject to which devnet node does the simulation
    txSignature = await DEVNET_CONNECTION.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: true, preflightCommitment: "confirmed" },
    );

    // Wait for confirmation (30s timeout to avoid hanging forever on devnet)
    const { blockhash, lastValidBlockHeight } = await DEVNET_CONNECTION.getLatestBlockhash("confirmed");
    const confirmation = await Promise.race([
      DEVNET_CONNECTION.confirmTransaction(
        { signature: txSignature, blockhash, lastValidBlockHeight },
        "confirmed",
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Transaction confirmation timed out after 30s")), 30_000)
      ),
    ]);
    if ((confirmation as any)?.value?.err) {
      throw new Error(`Transaction failed on-chain: ${JSON.stringify((confirmation as any).value.err)}`);
    }
  } catch (err: any) {
    console.error("[pay] sign+send error:", err);
    return NextResponse.json({ error: err.message ?? "Payment failed" }, { status: 500 });
  }

  // Guard against duplicate payments
  const existing = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.txHash, txSignature))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ success: true, txHash: txSignature, content: listing.content, alreadyPurchased: true });
  }

  // Record payment
  await db.insert(payments).values({
    listingId,
    buyerAddress,
    txHash: txSignature,
    network: "solana-devnet",
    amountUsdc: listing.price,
    usdcAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    recipientAddress: recipient,
    isAgent: true,
    status: "confirmed",
  });

  await db
    .update(listings)
    .set({ salesCount: listing.salesCount + 1 })
    .where(eq(listings.id, listingId));

  return NextResponse.json({ success: true, txHash: txSignature, content: listing.content });
}
