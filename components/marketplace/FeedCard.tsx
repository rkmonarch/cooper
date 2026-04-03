"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Sparkles, FileText, ImageIcon, Database, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { UnlockModal } from "./UnlockModal";
import { usePurchases } from "@/lib/use-purchases";
import { formatUSDC } from "@/lib/utils";
import type { Listing } from "@/types";

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; accent: string }> = {
  "ai-image": { label: "AI Image",  icon: ImageIcon, color: "text-violet-700", bg: "bg-violet-100",  accent: "from-violet-500 to-purple-600"  },
  research:   { label: "Research",  icon: FileText,  color: "text-blue-700",   bg: "bg-blue-100",    accent: "from-blue-500 to-cyan-600"       },
  prompt:     { label: "Prompt",    icon: Sparkles,  color: "text-amber-700",  bg: "bg-amber-100",   accent: "from-amber-500 to-orange-500"    },
  dataset:    { label: "Dataset",   icon: Database,  color: "text-emerald-700",bg: "bg-emerald-100", accent: "from-emerald-500 to-teal-600"    },
  other:      { label: "Other",     icon: Package,   color: "text-slate-600",  bg: "bg-slate-100",   accent: "from-slate-500 to-gray-600"      },
};

const categoryPlaceholder: Record<string, string> = {
  "ai-image": "from-violet-200 via-purple-100 to-fuchsia-200",
  research:   "from-blue-200 via-sky-100 to-cyan-200",
  prompt:     "from-amber-200 via-orange-100 to-yellow-200",
  dataset:    "from-emerald-200 via-teal-100 to-green-200",
  other:      "from-slate-200 via-gray-100 to-zinc-200",
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

  function handleClick() {
    if (unlocked) router.push(`/content/${listing.id}`);
    else setModalOpen(true);
  }

  return (
    <>
      <article
        onClick={handleClick}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white cursor-pointer
                   shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06)]
                   hover:shadow-[0_8px_40px_rgba(0,0,0,0.14)]
                   transition-all duration-300 hover:-translate-y-1"
      >
        {/* ── Image ─────────────────────────────────────────────────────────── */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          {listing.previewUrl ? (
            <img
              src={listing.previewUrl}
              alt={listing.title}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]
                          ${unlocked ? "" : "blur-sm scale-[1.04]"}`}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${placeholder}`}>
              <Icon className="h-14 w-14 opacity-20 text-neutral-700" />
            </div>
          )}

          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge — top left */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold
                              ${meta.bg} ${meta.color} shadow-sm backdrop-blur-sm`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
          </div>

          {/* Price badge — top right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1
                             text-[0.75rem] font-bold text-neutral-900 shadow-sm backdrop-blur-sm">
              {formatUSDC(price)}
            </span>
          </div>

          {/* Lock / purchased status — bottom center */}
          {!unlocked ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1
                               text-[0.68rem] font-semibold text-white backdrop-blur-sm">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1
                               text-[0.68rem] font-semibold text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3" />
                Purchased
              </span>
            </div>
          )}

          {/* Hover CTA */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
            <button
              className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${meta.accent}
                          px-3.5 py-1.5 text-[0.72rem] font-semibold text-white shadow-lg`}
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
            >
              <ShoppingCart className="h-3 w-3" />
              {unlocked ? "Open" : "Unlock"}
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div>
            <h3 className="line-clamp-1 text-[0.95rem] font-bold leading-snug text-neutral-900 group-hover:text-neutral-700 transition-colors">
              {listing.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {listing.description}
            </p>
          </div>

          {/* Creator row */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
            <div className="flex items-center gap-2 min-w-0">
              {/* Avatar */}
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${meta.accent} text-[0.6rem] font-bold text-white uppercase shadow-sm`}>
                {listing.creatorName?.[0] ?? "?"}
              </div>
              <Link
                href={`/profile/${listing.creatorUsername ?? listing.creatorAddress}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {listing.creatorName}
              </Link>
            </div>
            <span className="flex-shrink-0 text-xs text-neutral-400">
              {listing.salesCount} sold
            </span>
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
