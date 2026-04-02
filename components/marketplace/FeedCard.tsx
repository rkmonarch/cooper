"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Sparkles, FileText, ImageIcon, Database, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { UnlockModal } from "./UnlockModal";
import { usePurchases } from "@/lib/use-purchases";
import { formatUSDC } from "@/lib/utils";
import type { Listing } from "@/types";

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  "ai-image": { label: "AI Image",  icon: ImageIcon, color: "text-violet-600", bg: "bg-violet-50" },
  research:   { label: "Research",  icon: FileText,  color: "text-blue-600",   bg: "bg-blue-50"   },
  prompt:     { label: "Prompt",    icon: Sparkles,  color: "text-amber-600",  bg: "bg-amber-50"  },
  dataset:    { label: "Dataset",   icon: Database,  color: "text-emerald-600",bg: "bg-emerald-50"},
  other:      { label: "Other",     icon: Package,   color: "text-slate-500",  bg: "bg-slate-50"  },
};

const categoryPlaceholder: Record<string, string> = {
  "ai-image": "bg-gradient-to-br from-violet-100 to-purple-200",
  research:   "bg-gradient-to-br from-blue-100 to-sky-200",
  prompt:     "bg-gradient-to-br from-amber-100 to-orange-200",
  dataset:    "bg-gradient-to-br from-emerald-100 to-teal-200",
  other:      "bg-gradient-to-br from-slate-100 to-gray-200",
};

export function FeedCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { purchasedIds, markPurchased } = usePurchases();
  const [modalOpen, setModalOpen] = useState(false);

  const unlocked = purchasedIds.has(listing.id);
  const meta = categoryMeta[listing.category] ?? categoryMeta.other;
  const Icon = meta.icon;
  const placeholder = categoryPlaceholder[listing.category] ?? categoryPlaceholder.other;
  const price = Number(listing.price);

  function handleUnlockSuccess() {
    markPurchased(listing.id);
    setModalOpen(false);
    router.push(`/content/${listing.id}`);
  }

  return (
    <>
      <article
        className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-200 hover:border-neutral-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer"
        onClick={() => !unlocked ? setModalOpen(true) : router.push(`/content/${listing.id}`)}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
          {listing.previewUrl ? (
            <img
              src={listing.previewUrl}
              alt={listing.title}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
                unlocked ? "" : "blur-md scale-105"
              }`}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${placeholder}`}>
              <Icon className="h-10 w-10 opacity-30 text-[var(--foreground)]" />
            </div>
          )}

          {/* Lock pill — bottom center, only when locked */}
          {!unlocked && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[0.68rem] font-semibold text-white backdrop-blur-sm">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            </div>
          )}

          {/* Unlocked indicator */}
          {unlocked && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[0.68rem] font-semibold text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3" />
                Purchased
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4 gap-3">
          {/* Category + price row */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold ${meta.bg} ${meta.color}`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {formatUSDC(price)}
            </span>
          </div>

          {/* Title + description */}
          <div className="flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 leading-snug">
              {listing.title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {listing.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[0.55rem] font-bold text-neutral-500 uppercase">
                {listing.creatorName?.[0] ?? "?"}
              </div>
              <Link
                href={`/profile/${listing.creatorUsername ?? listing.creatorAddress}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate text-xs text-neutral-500 hover:text-neutral-900 hover:underline transition-colors"
              >
                {listing.creatorName}
              </Link>
              <span className="text-neutral-300">·</span>
              <span className="flex-shrink-0 text-xs text-neutral-400">{listing.salesCount} sold</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
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
