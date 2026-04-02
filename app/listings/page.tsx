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
    <div className="min-h-screen bg-neutral-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-[0.65rem] font-black uppercase tracking-[0.22em] text-neutral-400">
            Cooper Marketplace
          </p>
          <h1 className="text-[2.6rem] font-black leading-none tracking-[-0.05em] text-neutral-900 sm:text-5xl">
            Browse content
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
            Prompts, research, datasets & AI images. Pay once with USDC — unlocks instantly.
          </p>

          {/* Search */}
          <div className="mt-6 flex max-w-sm items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 focus-within:border-neutral-400 focus-within:bg-white transition-colors">
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

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Filter tabs ───────────────────────────────────────────────────── */}
        <div className="sticky top-[68px] z-10 -mx-4 overflow-x-auto border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-0.5">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.value;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`relative flex shrink-0 items-center gap-1.5 px-4 py-3.5 text-xs font-semibold transition-colors ${
                    active
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  {cat.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-neutral-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Results meta ─────────────────────────────────────────────────── */}
        {!loading && (
          <p className="mt-5 mb-4 text-xs text-neutral-400">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "all" && ` · ${CATEGORIES.find((c) => c.value === activeCategory)?.label}`}
            {query && ` · matching "${query}"`}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} hasQuery={!!query} />
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 lg:grid-cols-4">
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
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white animate-pulse">
      <div className="aspect-[16/10] w-full bg-neutral-100" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded-md bg-neutral-100" />
          <div className="h-4 w-10 rounded-md bg-neutral-100" />
        </div>
        <div className="h-3.5 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-3 w-full rounded-full bg-neutral-100" />
        <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

function EmptyState({ category, hasQuery }: { category: ListingCategory | "all"; hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Package className="h-5 w-5 text-neutral-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800">Nothing here yet</p>
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
