"use client";

import { useEffect, useState } from "react";
import { useWallet } from "./use-wallet";
import { isPurchased, recordPurchase } from "./purchases";

/**
 * Hook that returns a Set of purchased listing IDs for the connected OWS wallet.
 * Hydrates from localStorage (instant) then DB (authoritative).
 */
export function usePurchases(): {
  purchasedIds: Set<string>;
  markPurchased: (listingId: string) => void;
} {
  const { session } = useWallet();
  const address = session?.walletAddress ?? null;

  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!address) {
      setPurchasedIds(new Set());
      return;
    }

    fetch(`/api/purchases?buyer=${address}`)
      .then((r) => r.json())
      .then(({ purchasedIds: ids }: { purchasedIds: string[] }) => {
        if (!Array.isArray(ids)) return;
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
