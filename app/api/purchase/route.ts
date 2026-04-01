import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, buyerAddress, isAgent } = body;

  if (!listingId || !buyerAddress) {
    return NextResponse.json({ error: "Missing listingId or buyerAddress" }, { status: 400 });
  }

  // Fetch the listing
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // --- x402 payment verification ---
  // In production: validate the x-payment header from the request containing the signed tx.
  // For demo/hackathon: simulate a confirmed payment and generate a mock tx hash.
  const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

  // Record payment
  const [purchase] = await db
    .insert(payments)
    .values({
      listingId,
      buyerAddress,
      txHash,
      network: "base-sepolia",
      amountUsdc: listing.price,
      usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      recipientAddress: listing.creatorAddress,
      isAgent: isAgent ?? false,
      status: "confirmed",
    })
    .returning();

  // Increment sales count
  await db
    .update(listings)
    .set({ salesCount: listing.salesCount + 1 })
    .where(eq(listings.id, listingId));

  // Return the unlocked content
  return NextResponse.json({
    success: true,
    txHash,
    content: listing.content,
    purchaseId: purchase.id,
  });
}
