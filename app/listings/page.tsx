"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, FileText, ImageIcon, Database, Package, Globe, TrendingUp, TrendingDown, ArrowUpDown, X } from "lucide-react";
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

type SortOption = "newest" | "most_bought" | "least_bought" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: "newest",      label: "Newest",       icon: ArrowUpDown  },
  { value: "most_bought", label: "Most bought",  icon: TrendingUp   },
  { value: "least_bought",label: "Least bought", icon: TrendingDown },
  { value: "price_asc",   label: "Price: low",   icon: ArrowUpDown  },
  { value: "price_desc",  label: "Price: high",  icon: ArrowUpDown  },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ListingCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (sort !== "newest") params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    try {
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sort, minPrice, maxPrice]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const hasPriceFilter = minPrice || maxPrice;

  function clearPriceFilter() {
    setMinPrice("");
    setMaxPrice("");
    setShowPriceFilter(false);
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-neutral-400">
            Cooper Marketplace
          </p>
          <div>
            <h1 className="text-5xl font-black leading-none tracking-[-0.04em] text-neutral-900 sm:text-6xl">
              Browse
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500 whitespace-nowrap">
              Prompts, research, datasets & AI images. Pay once with USDC — unlocks instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Filter bar ────────────────────────────────────────────────────── */}
        <div className="sticky top-[68px] z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-b border-[var(--border)]
                        bg-[var(--background)]/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">

            {/* Category pills */}
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

            {/* Divider */}
            <div className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />

            {/* Sort pills */}
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;
              const SortIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold
                              transition-all duration-150
                              ${active
                                ? "bg-[var(--accent-strong)] text-white shadow-sm"
                                : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                              }`}
                >
                  <SortIcon className="h-3 w-3" />
                  {opt.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />

            {/* Price range toggle */}
            <button
              onClick={() => setShowPriceFilter((v) => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold
                          transition-all duration-150
                          ${hasPriceFilter
                            ? "bg-[var(--accent-strong)] text-white shadow-sm"
                            : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                          }`}
            >
              $ Price range
              {hasPriceFilter && (
                <span
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 hover:bg-white/50"
                  onClick={(e) => { e.stopPropagation(); clearPriceFilter(); }}
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          </div>

          {/* Price range inputs — inline below filter bar */}
          {showPriceFilter && (
            <div className="flex items-center gap-3 pb-3">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                <span className="text-neutral-400 font-medium">Min $</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-16 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-300"
                />
              </div>
              <span className="text-xs text-neutral-400">to</span>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                <span className="text-neutral-400 font-medium">Max $</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-16 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-300"
                />
              </div>
              {hasPriceFilter && (
                <button onClick={clearPriceFilter} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Results count ─────────────────────────────────────────────────── */}
        {!loading && (
          <p className="mt-6 mb-4 text-xs text-neutral-400">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
            {activeCategory !== "all" && ` · ${CATEGORIES.find((c) => c.value === activeCategory)?.label}`}
            {hasPriceFilter && ` · $${minPrice || "0"} – $${maxPrice || "∞"}`}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState category={activeCategory} hasQuery={false} />
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
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
