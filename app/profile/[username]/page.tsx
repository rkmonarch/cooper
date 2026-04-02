"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FeedCard } from "@/components/marketplace/FeedCard";
import { Package, Copy, Check, ExternalLink } from "lucide-react";
import type { Listing } from "@/types";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

interface ProfileData {
  user: { walletAddress: string; displayName: string | null; username: string | null };
  listings: Listing[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => r.json())
      .then((d) => setData(d.error ? null : d))
      .finally(() => setLoading(false));
  }, [username]);

  function handleCopy() {
    if (!data?.user.walletAddress) return;
    navigator.clipboard.writeText(data.user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const listings = data?.listings ?? [];
  const displayName = data?.user.displayName ?? username;
  const walletAddress = data?.user.walletAddress ?? "";
  const totalSales = listings.reduce((sum, l) => sum + l.salesCount, 0);
  const totalVolume = listings.reduce((sum, l) => sum + Number(l.price) * l.salesCount, 0);

  if (!loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-800">User not found</p>
          <p className="mt-1 text-xs text-neutral-400">@{username} doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Profile hero ────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl font-black text-white">
                {displayName[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
                  {displayName}
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">@{username}</p>
                {walletAddress && (
                  <button
                    onClick={handleCopy}
                    className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <span className="font-mono">{shortenAddress(walletAddress)}</span>
                    {copied
                      ? <Check className="h-3 w-3 text-emerald-500" />
                      : <Copy className="h-3 w-3" />
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-black tracking-[-0.04em] text-neutral-900">{listings.length}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black tracking-[-0.04em] text-neutral-900">{totalSales}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black tracking-[-0.04em] text-neutral-900">{totalVolume.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">USDC earned</p>
                </div>
              </div>
            )}
          </div>

          {walletAddress && (
            <a
              href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View on Solana Explorer
            </a>
          )}
        </div>
      </div>

      {/* ── Listings grid ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="aspect-[16/10] bg-neutral-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 w-3/4 rounded-full bg-neutral-100" />
                  <div className="h-3 w-full rounded-full bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Package className="h-5 w-5 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">No listings yet</p>
              <p className="mt-1 text-xs text-neutral-400">This creator hasn't listed anything.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-neutral-400">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing) => (
                <FeedCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
