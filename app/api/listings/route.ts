import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { ilike, lte, eq, and, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const maxPrice = searchParams.get("maxPrice");
  const category = searchParams.get("category");
  const creatorAddress = searchParams.get("creatorAddress");

  const filters: SQL[] = [];

  if (q) filters.push(ilike(listings.title, `%${q}%`));
  if (maxPrice) filters.push(lte(listings.price, maxPrice));
  if (creatorAddress) filters.push(eq(listings.creatorAddress, creatorAddress));
  if (category) {
    filters.push(eq(listings.category, category));
  }

  const rows = await db
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
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(listings.createdAt);

  return NextResponse.json({ listings: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, price, category, creatorAddress, creatorName, content, previewUrl, allowDownload } =
    body;

  if (!title || !description || !price || !category || !creatorName || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contentHash = await hashContent(content);

  const [row] = await db
    .insert(listings)
    .values({
      title,
      description,
      price: String(price),
      category,
      previewUrl: previewUrl ?? null,
      creatorAddress: creatorAddress ?? "anonymous",
      creatorName,
      contentHash,
      content,
      allowDownload: allowDownload !== false,
    })
    .returning();

  return NextResponse.json({ listing: row }, { status: 201 });
}

async function hashContent(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
