"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { FeedCard } from "@/components/marketplace/FeedCard";
import type { Listing, ListingCategory } from "@/types";

const CATEGORIES: { value: ListingCategory | "all"; label: string; emoji: string }[] = [
  { value: "all",      label: "All",      emoji: "🌐" },
  { value: "prompt",   label: "Prompts",  emoji: "✨" },
  { value: "research", label: "Research", emoji: "📄" },
  { value: "ai-image", label: "AI Images",emoji: "🎨" },
  { value: "dataset",  label: "Datasets", emoji: "📊" },
  { value: "other",    label: "Other",    emoji: "📦" },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ListingCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  function handleSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 350);
  }

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
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
  }, [debouncedSearch, activeCategory]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] px-4 py-12 sm:px-6 lg:px-8">
        {/* decorative rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border-[32px] border-[var(--success-soft)] opacity-70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-100/60"
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Marketplace
          </p>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-[var(--foreground)] sm:text-5xl">
            Discover content.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Premium prompts, research, datasets, and AI images. Pay once via x402 — content unlocks instantly.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex max-w-lg items-center gap-3 rounded-[1.4rem] border border-[var(--border)] bg-white/80 px-4 py-3 shadow-[0_4px_16px_rgba(54,72,42,0.07)] focus-within:border-[var(--success)] focus-within:shadow-[0_4px_20px_rgba(89,124,67,0.14)] transition-all">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                className="rounded-full p-0.5 transition-colors hover:bg-black/5"
              >
                <X className="h-3.5 w-3.5 text-[var(--muted)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Category filter tabs ─────────────────────────────────────────── */}
        <div className="sticky top-[72px] z-10 -mx-4 overflow-x-auto bg-[var(--background)]/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? "bg-[var(--foreground)] text-white shadow-[0_4px_12px_rgba(54,72,42,0.18)]"
                      : "border border-[var(--border)] bg-white/80 text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Results count ────────────────────────────────────────────────── */}
        {!loading && (
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--muted)]" />
            <span className="text-xs text-[var(--muted)]">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
              {activeCategory !== "all" && ` in ${CATEGORIES.find((c) => c.value === activeCategory)?.label}`}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </span>
          </div>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState search={debouncedSearch} category={activeCategory} />
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <FeedCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] animate-pulse">
      <div className="aspect-[4/3] w-full bg-[var(--border)]" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 w-3/4 rounded-full bg-[var(--border)]" />
        <div className="h-3 w-full rounded-full bg-[var(--border)]" />
        <div className="h-3 w-2/3 rounded-full bg-[var(--border)]" />
        <div className="mt-3 h-8 w-full rounded-[1rem] bg-[var(--border)]" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  search,
  category,
}: {
  search: string;
  category: ListingCategory | "all";
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-white/55 py-24 text-center">
      <span className="text-5xl">📭</span>
      <div>
        <p className="font-black tracking-[-0.04em] text-[var(--foreground)]">No listings found</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {search
            ? `No results for "${search}"${category !== "all" ? " in this category" : ""}`
            : "Be the first to drop something into the marketplace."}
        </p>
      </div>
    </div>
  );
}
