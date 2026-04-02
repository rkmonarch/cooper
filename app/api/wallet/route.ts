import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateOwsWallet, solanaAddress, walletName } from "@/lib/ows";
import { DEVNET_CONNECTION, USDC_DEVNET_MINT, USDC_DECIMALS } from "@/lib/solana-payment";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const dynamic = "force-dynamic";

/** POST /api/wallet — create or retrieve OWS wallet for a userId */
export async function POST(req: NextRequest) {
  try {
    const { userId, displayName } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Create or get the OWS wallet (idempotent by wallet name)
    const wallet = getOrCreateOwsWallet(userId);
    const address = solanaAddress(wallet);

    // Upsert user by wallet address (guaranteed unique column)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.walletAddress, address))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values({
        walletAddress: address,
        displayName: displayName ?? "Anonymous",
        owsVaultId: walletName(userId),
      });
    } else {
      await db
        .update(users)
        .set({ lastSeenAt: new Date(), ...(displayName ? { displayName } : {}) })
        .where(eq(users.walletAddress, address));
    }

    return NextResponse.json({ walletAddress: address, displayName, userId });
  } catch (err: any) {
    console.error("[wallet] POST error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to create wallet" }, { status: 500 });
  }
}

/** GET /api/wallet?userId=xxx — get wallet address + balances */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const wallet = getOrCreateOwsWallet(userId);
    const address = solanaAddress(wallet);
    const pubkey = new PublicKey(address);

    const ata = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, pubkey);
    const [solLamports, ataInfo] = await Promise.all([
      DEVNET_CONNECTION.getBalance(pubkey).catch(() => 0),
      DEVNET_CONNECTION.getAccountInfo(ata).catch(() => null),
    ]);

    const solBalance = solLamports / 1e9;
    let usdcBalance = 0;
    if (ataInfo) {
      const rawAmount = ataInfo.data.readBigUInt64LE(64);
      usdcBalance = Number(rawAmount) / 10 ** USDC_DECIMALS;
    }

    return NextResponse.json({ walletAddress: address, solBalance, usdcBalance });
  } catch (err: any) {
    console.error("[wallet] GET error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to get wallet" }, { status: 500 });
  }
}
