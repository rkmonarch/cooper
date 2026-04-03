import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, listings } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // Accept both username and wallet address so old links don't break
  const [user] = await db
    .select({ walletAddress: users.walletAddress, displayName: users.displayName, username: users.username })
    .from(users)
    .where(or(eq(users.username, username), eq(users.walletAddress, username)))
    .limit(1);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userListings = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      category: listings.category,
      previewUrl: listings.previewUrl,
      creatorAddress: listings.creatorAddress,
      creatorName: listings.creatorName,
      contentHash: listings.contentHash,
      allowDownload: listings.allowDownload,
      salesCount: listings.salesCount,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .where(eq(listings.creatorAddress, user.walletAddress))
    .orderBy(listings.createdAt);

  return NextResponse.json({ user, listings: userListings });
}
