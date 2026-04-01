import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  const buyer = req.nextUrl.searchParams.get("buyer");

  if (!buyer) {
    return NextResponse.json({ error: "Missing buyer address." }, { status: 400 });
  }

  // Verify the buyer has paid for this listing
  const [payment] = await db
    .select({ id: payments.id, paidAt: payments.paidAt, txHash: payments.txHash })
    .from(payments)
    .where(and(eq(payments.listingId, listingId), eq(payments.buyerAddress, buyer)))
    .limit(1);

  if (!payment) {
    return NextResponse.json({ error: "No payment found for this listing." }, { status: 403 });
  }

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({
    listing: {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      previewUrl: listing.previewUrl,
      creatorName: listing.creatorName,
      creatorAddress: listing.creatorAddress,
      price: listing.price,
      allowDownload: listing.allowDownload,
    },
    content: listing.content,
    payment: {
      txHash: payment.txHash,
      paidAt: payment.paidAt,
    },
  });
}
