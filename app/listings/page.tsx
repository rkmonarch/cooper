"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, FileText, ImageIcon, Database, Package, Globe, Search } from "lucide-react";
import { FeedCard } from "@/components/marketplace/FeedCard";
import type { Listing, ListingCategory } from "@/types";

const CATEGORIES: {
  value: ListingCategory | "all";
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all",      label: "All",       icon: Globe     },
  { value: "prompt",   label: "Prompts",   icon: Sparkles  },
  { value: "research", label: "Research",  icon: FileText  },
  { value: "ai-image", label: "AI Images", icon: ImageIcon },
  { value: "dataset",  label: "Datasets",  icon: Database  },
  { value: "other",    label: "Other",     icon: Package   },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ListingCategory | "all">("all");
  const [query, setQuery] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    try {
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filtered = query.trim()
    ? listings.filter((l) =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.description?.toLowerCase().includes(query.toLowerCase())
      )
    : listings;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-neutral-400">
            Cooper Marketplace
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-5xl font-black leading-none tracking-[-0.04em] text-neutral-900 sm:text-6xl">
                Browse
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                Prompts, research, datasets & AI images. Pay once with USDC — unlocks instantly.
              </p>
            </div>

            {/* Search */}
            <div className="flex w-full max-w-xs items-center gap-2.5 rounded-2xl border border-neutral-200
                            bg-neutral-50 px-4 py-3 focus-within:border-neutral-400 focus-within:bg-white
                            transition-all shadow-sm focus-within:shadow-md">
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
              <input
                type="text"
                placeholder="Search listings…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Filter pills ──────────────────────────────────────────────────── */}
        <div className="sticky top-[68px] z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-b border-neutral-200
                        bg-[#f7f7f5]/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.value;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold
                              transition-all duration-150
                              ${active
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                              }`}
                >
                  <CatIcon className="h-3 w-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Results count ─────────────────────────────────────────────────── */}
        {!loading && (
          <p className="mt-6 mb-4 text-xs text-neutral-400">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "all" && ` · ${CATEGORIES.find((c) => c.value === activeCategory)?.label}`}
            {query && ` · matching "${query}"`}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} hasQuery={!!query} />
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <FeedCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white animate-pulse
                    shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="aspect-[4/3] w-full bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 rounded-lg bg-neutral-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-neutral-100" />
          <div className="h-3 w-4/5 rounded-full bg-neutral-100" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-neutral-100" />
            <div className="h-3 w-20 rounded-full bg-neutral-100" />
          </div>
          <div className="h-3 w-10 rounded-full bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ category, hasQuery }: { category: ListingCategory | "all"; hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200
                    bg-white py-24 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        <Package className="h-6 w-6 text-neutral-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-neutral-800">Nothing here yet</p>
        <p className="mt-1 text-xs text-neutral-400">
          {hasQuery
            ? "Try a different search term."
            : category !== "all"
            ? "No listings in this category."
            : "Be the first to list something."}
        </p>
      </div>
    </div>
  );
}
