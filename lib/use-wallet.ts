"use client";

import { useSession } from "next-auth/react";

export interface WalletSession {
  userId: string;
  walletAddress: string;
  displayName: string;
  username?: string;
  image?: string;
}

/**
 * Returns the current user's wallet session derived from Google auth.
 * walletAddress may be undefined briefly on first sign-in while the JWT
 * callback creates the OWS wallet — use `loading` to guard renders.
 */
export function useWallet() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (!session?.user) {
    return { session: null, loading };
  }

  const user = session.user as any;
  const walletSession: WalletSession | null = user.walletAddress
    ? {
        userId: user.id ?? user.sub ?? "",
        walletAddress: user.walletAddress,
        displayName: user.name ?? user.email ?? "Anonymous",
        username: user.username ?? undefined,
        image: user.image ?? undefined,
      }
    : null;

  return { session: walletSession, loading };
}
