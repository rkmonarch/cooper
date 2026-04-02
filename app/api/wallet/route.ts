import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { walletName } from "@/lib/ows";
import { remoteGetOrCreateWallet } from "@/lib/signer-client";
import { DEVNET_CONNECTION, USDC_DEVNET_MINT, USDC_DECIMALS } from "@/lib/solana-payment";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const dynamic = "force-dynamic";

/** POST /api/wallet — create or retrieve OWS wallet for a userId */
export async function POST(req: NextRequest) {
  try {
    const { userId, displayName, email } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const vaultId = walletName(userId);

    // ── Step 1: look up by email — most reliable, stable across deployments ──
    // Email comes from Google OAuth and never changes for the same account.
    // This must happen BEFORE calling getOrCreateOwsWallet, because on a new
    // deployment the OWS vault is empty and would generate a different address.
    if (email) {
      const byEmail = await db
        .select({ id: users.id, walletAddress: users.walletAddress, owsVaultId: users.owsVaultId })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (byEmail.length > 0) {
        const existingVaultId = byEmail[0].owsVaultId ?? vaultId;
        // Always ensure the signer server has this wallet in its vault.
        // This handles signer redeployments where the vault is wiped.
        await remoteGetOrCreateWallet(existingVaultId).catch(() => null);
        await db
          .update(users)
          .set({
            lastSeenAt: new Date(),
            ...(displayName ? { displayName } : {}),
            ...(!byEmail[0].owsVaultId ? { owsVaultId: vaultId } : {}),
          })
          .where(eq(users.id, byEmail[0].id));
        return NextResponse.json({ walletAddress: byEmail[0].walletAddress, userId });
      }
    }

    // ── Step 2: look up by owsVaultId (same deployment / vault still intact) ──
    const byVaultId = await db
      .select({ id: users.id, walletAddress: users.walletAddress })
      .from(users)
      .where(eq(users.owsVaultId, vaultId))
      .limit(1);

    if (byVaultId.length > 0) {
      await db
        .update(users)
        .set({ lastSeenAt: new Date(), ...(email ? { email } : {}), ...(displayName ? { displayName } : {}) })
        .where(eq(users.id, byVaultId[0].id));
      return NextResponse.json({ walletAddress: byVaultId[0].walletAddress, userId });
    }

    // ── Step 3: truly new user — create OWS wallet via signer server and insert ──
    const address = await remoteGetOrCreateWallet(vaultId);

    await db.insert(users).values({
      walletAddress: address,
      displayName: displayName ?? "Anonymous",
      owsVaultId: vaultId,
      ...(email ? { email } : {}),
    } as any);

    return NextResponse.json({ walletAddress: address, userId });
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

    // Always use the address stored in DB — do NOT re-derive from OWS,
    // as a new deployment would produce a different address.
    const vaultId = walletName(userId);
    const [user] = await db
      .select({ walletAddress: users.walletAddress })
      .from(users)
      .where(eq(users.owsVaultId, vaultId))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const address = user.walletAddress;
    const pubkey = new PublicKey(address);
    const ata = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, pubkey);

    const [solLamports, tokenBalance] = await Promise.all([
      DEVNET_CONNECTION.getBalance(pubkey).catch(() => 0),
      DEVNET_CONNECTION.getTokenAccountBalance(ata).catch(() => null),
    ]);

    const solBalance = solLamports / 1e9;
    const usdcBalance = tokenBalance ? Number(tokenBalance.value.uiAmount ?? 0) : 0;

    return NextResponse.json({ walletAddress: address, solBalance, usdcBalance });
  } catch (err: any) {
    console.error("[wallet] GET error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to get wallet" }, { status: 500 });
  }
}
