/** Persists which listing IDs a wallet address has purchased, keyed by address. */

function storageKey(address: string) {
  return `cooper_purchased_${address}`;
}

export function isPurchased(address: string, listingId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(listingId);
  } catch {
    return false;
  }
}

export function recordPurchase(address: string, listingId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = storageKey(address);
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!existing.includes(listingId)) {
      localStorage.setItem(key, JSON.stringify([...existing, listingId]));
    }
  } catch {}
}
