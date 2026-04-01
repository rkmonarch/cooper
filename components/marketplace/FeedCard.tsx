"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, TrendingUp, Sparkles, FileText, Image, Database, Package } from "lucide-react";
import { useAccounts, AddressType } from "@phantom/react-sdk";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatUSDC } from "@/lib/utils";
import { UnlockModal } from "./UnlockModal";
import { usePurchases } from "@/lib/use-purchases";
import type { Listing } from "@/types";

const categoryGradient: Record<string, string> = {
  "ai-image": "from-violet-200 via-pink-100 to-fuchsia-200",
  research:   "from-sky-200 via-cyan-100 to-blue-200",
  prompt:     "from-amber-200 via-orange-100 to-yellow-200",
  dataset:    "from-emerald-200 via-teal-100 to-green-200",
  other:      "from-stone-200 via-zinc-100 to-slate-200",
};

const CategoryIcon: Record<string, React.ElementType> = {
  "ai-image": Image,
  research:   FileText,
  prompt:     Sparkles,
  dataset:    Database,
  other:      Package,
};

export function FeedCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { purchasedIds, markPurchased } = usePurchases();
  const [modalOpen, setModalOpen] = useState(false);

  const unlocked = purchasedIds.has(listing.id);

  function handleUnlockSuccess(content: string) {
    markPurchased(listing.id);
    setModalOpen(false);
    router.push(`/content/${listing.id}`);
  }

  const gradient = categoryGradient[listing.category] ?? categoryGradient.other;
  const Icon = CategoryIcon[listing.category] ?? Package;

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_24px_rgba(54,72,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(54,72,42,0.12)]">

        {/* ── Preview image area ───────────────────────────────────────── */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {listing.previewUrl ? (
            <img
              src={listing.previewUrl}
              alt={listing.title}
              className={`h-full w-full object-cover transition-all duration-500 ${
                unlocked ? "blur-0 scale-100" : "blur-xl scale-110"
              }`}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
              <Icon
                className={`h-14 w-14 transition-all duration-500 ${
                  unlocked ? "opacity-60 blur-0" : "opacity-40 blur-sm"
                } text-[var(--foreground)]`}
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Lock overlay (locked only) */}
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-full bg-black/40 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  Pay to unlock
                </span>
              </div>
            </div>
          )}

          {/* Unlocked badge */}
          {unlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--success)]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Unlocked
              </div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <Badge category={listing.category} />
          </div>

          {/* Price chip */}
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-black text-[var(--accent-foreground)] shadow-[0_4px_12px_rgba(242,141,79,0.35)]">
              {formatUSDC(Number(listing.price))}
            </span>
          </div>
        </div>

        {/* ── Card body ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="line-clamp-1 text-sm font-black leading-snug tracking-[-0.03em] text-[var(--foreground)]">
              {listing.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {listing.description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 text-[0.68rem] text-[var(--muted)]">
            <TrendingUp className="h-3 w-3 flex-shrink-0" />
            <span>{listing.salesCount} sold</span>
            <span className="mx-1 opacity-40">·</span>
            <span className="truncate font-mono">{listing.creatorName}</span>
          </div>

          <div className="border-t border-[var(--border)] pt-3">
            {unlocked ? (
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push(`/content/${listing.id}`)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                View content
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setModalOpen(true)}
              >
                <Lock className="h-3.5 w-3.5" />
                Unlock · {formatUSDC(Number(listing.price))}
              </Button>
            )}
          </div>
        </div>
      </article>

      <UnlockModal
        listing={listing}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUnlockSuccess}
      />
    </>
  );
}
