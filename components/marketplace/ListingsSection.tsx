"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "./ListingCard";
import type { Listing } from "@/types";
import { Loader2 } from "lucide-react";

export function ListingsSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data) => setListings(data.listings ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-strong)]" />
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-white/55 py-24 text-center text-[var(--muted)]">
        <p className="mb-3 text-4xl">📭</p>
        <p className="font-semibold text-[var(--foreground)]">No listings yet</p>
        <p className="mt-1 text-sm">Be the first to drop something into the pod.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
