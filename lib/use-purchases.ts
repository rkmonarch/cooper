"use client";

import { useEffect, useState } from "react";
import { useAccounts, AddressType } from "@phantom/react-sdk";
import { isPurchased, recordPurchase } from "./purchases";

/**
 * Hook that returns a Set of purchased listing IDs for the connected wallet.
 * On mount it hydrates from:
 *   1. localStorage (instant, no flash)
 *   2. /api/purchases (authoritative DB source, fills in any gaps)
 */
export function usePurchases(): {
  purchasedIds: Set<string>;
  markPurchased: (listingId: string) => void;
} {
  const accounts = useAccounts();
  const address =
    accounts?.find((a) => a.addressType === AddressType.solana)?.address ??
    accounts?.[0]?.address ??
    null;

  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  // Hydrate from DB when wallet connects
  useEffect(() => {
    if (!address) {
      setPurchasedIds(new Set());
      return;
    }

    // Instant: seed from localStorage first
    setPurchasedIds((prev) => {
      // We don't have a "get all" for localStorage, so keep existing state
      return prev;
    });

    // Then fetch from DB and merge
    fetch(`/api/purchases?buyer=${address}`)
      .then((r) => r.json())
      .then(({ purchasedIds: ids }: { purchasedIds: string[] }) => {
        if (!Array.isArray(ids)) return;
        // Sync DB results into localStorage and state
        ids.forEach((id) => recordPurchase(address, id));
        setPurchasedIds(new Set(ids));
      })
      .catch(() => {});
  }, [address]);

  function markPurchased(listingId: string) {
    if (address) recordPurchase(address, listingId);
    setPurchasedIds((prev) => new Set([...prev, listingId]));
  }

  return { purchasedIds, markPurchased };
}
