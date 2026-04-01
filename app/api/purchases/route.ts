import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Returns all listing IDs the buyer has successfully paid for. */
export async function GET(req: NextRequest) {
  const buyer = req.nextUrl.searchParams.get("buyer");
  if (!buyer) {
    return NextResponse.json({ error: "Missing buyer address." }, { status: 400 });
  }

  const rows = await db
    .select({ listingId: payments.listingId })
    .from(payments)
    .where(eq(payments.buyerAddress, buyer));

  return NextResponse.json({ purchasedIds: rows.map((r) => r.listingId) });
}
