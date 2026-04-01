"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatUSDC } from "@/lib/utils";
import { Lock, TrendingUp, CheckCircle2 } from "lucide-react";
import type { Listing } from "@/types";
import { UnlockModal } from "./UnlockModal";
import { usePurchases } from "@/lib/use-purchases";

const categoryGradients: Record<string, string> = {
  "ai-image":  "from-lime-100 via-green-50  to-emerald-100",
  research:    "from-sky-100  via-cyan-50   to-blue-100",
  prompt:      "from-orange-100 via-amber-50 to-yellow-100",
  dataset:     "from-emerald-100 via-teal-50 to-green-100",
  other:       "from-stone-100 via-amber-50 to-stone-100",
};

const categoryEmoji: Record<string, string> = {
  "ai-image": "🎨",
  research:   "📄",
  prompt:     "✨",
  dataset:    "📊",
  other:      "📦",
};

interface ListingCardProps {
  listing: Listing;
  onUnlock?: (listing: Listing) => void;
}

export function ListingCard({ listing, onUnlock }: ListingCardProps) {
  const router = useRouter();
  const { purchasedIds, markPurchased } = usePurchases();
  const [modalOpen, setModalOpen] = useState(false);

  const unlocked = purchasedIds.has(listing.id);

  function handleUnlockSuccess(content: string) {
    markPurchased(listing.id);
    setModalOpen(false);
    onUnlock?.(listing);
    router.push(`/content/${listing.id}`);
  }

  const gradient = categoryGradients[listing.category] ?? categoryGradients.other;
  const emoji    = categoryEmoji[listing.category] ?? "📦";

  return (
    <>
      <Card hover className="flex flex-col overflow-hidden">
        {/* Preview */}
        <div className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
          {listing.previewUrl ? (
            <img
              src={listing.previewUrl}
              alt={listing.title}
              className={`h-full w-full object-cover transition-all duration-500 ${
                unlocked ? "blur-0 scale-100" : "blur-lg scale-110"
              }`}
            />
          ) : (
            <span className={`select-none text-5xl transition-all duration-500 ${unlocked ? "" : "opacity-40 blur-sm"}`}>
              {emoji}
            </span>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Lock overlay */}
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <div className="rounded-full bg-white/25 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
                <Lock className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {unlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--success)]/85 px-2.5 py-1 text-[0.65rem] font-bold text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3" />
                Unlocked
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Badge category={listing.category} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--foreground)]">
              {listing.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {listing.description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <TrendingUp className="h-3 w-3" />
            <span>{listing.salesCount} sold</span>
            <span className="ml-auto font-mono">{listing.creatorName}</span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
            <span className="font-black text-[var(--accent-strong)]">
              {formatUSDC(Number(listing.price))}
            </span>
            {unlocked ? (
              <Button size="sm" onClick={() => router.push(`/content/${listing.id}`)}>
                <CheckCircle2 className="h-3 w-3" />
                View
              </Button>
            ) : (
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Lock className="h-3 w-3" />
                Unlock
              </Button>
            )}
          </div>
        </div>
      </Card>

      <UnlockModal
        listing={listing}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUnlockSuccess}
      />
    </>
  );
}
