"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Unlock, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatUSDC } from "@/lib/utils";
import type { Listing } from "@/types";

interface UnlockModalProps {
  listing: Listing;
  open: boolean;
  onClose: () => void;
  onSuccess: (content: string) => void;
}

export function UnlockModal({ listing, open, onClose, onSuccess }: UnlockModalProps) {
  const [step, setStep] = useState<"confirm" | "paying" | "done">("confirm");
  const [content, setContent] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  async function handlePay() {
    setStep("paying");
    setError(null);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerAddress: "demo-wallet",
          isAgent: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Payment failed");
        setStep("confirm");
        return;
      }

      const data = await res.json();
      setTxHash(data.txHash);
      setContent(data.content);
      setStep("done");
    } catch {
      setError("Network error");
      setStep("confirm");
    }
  }

  const modal = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_32px_60px_rgba(54,72,42,0.18)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <div className="flex items-center gap-2">
            {step === "done" ? (
              <Unlock className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <Lock className="h-5 w-5 text-[var(--accent-strong)]" />
            )}
            <h2 className="font-semibold text-[var(--foreground)]">
              {step === "done" ? "Content Unlocked!" : "Unlock Content"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-black/5">
            <X className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {step !== "done" && (
            <>
              <div className="flex items-start gap-3 rounded-[1.35rem] bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(89,124,67,0.1)]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-100 to-orange-100 text-xl">
                  {listing.category === "ai-image" && "🎨"}
                  {listing.category === "research" && "📄"}
                  {listing.category === "prompt" && "✨"}
                  {listing.category === "dataset" && "📊"}
                  {listing.category === "other" && "📦"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{listing.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{listing.description}</p>
                  <Badge category={listing.category} className="mt-1.5" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[1.35rem] border border-orange-200 bg-orange-100/75 p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--accent-strong)]">
                  <Zap className="h-4 w-4" />
                  <span>x402 Payment</span>
                </div>
                <span className="text-lg font-black tracking-[-0.04em] text-[var(--accent-strong)]">
                  {formatUSDC(Number(listing.price))}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--success)]" />
                <span>
                  Payment secured via x402 protocol. Your wallet keys stay in Phantom, and only
                  signed transactions leave your device.
                </span>
              </div>

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-600">
                  {error}
                </p>
              )}
            </>
          )}

          {step === "done" && content && (
            <div>
              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-[1.35rem] border border-lime-200 bg-lime-50/75 p-4 font-mono text-sm text-[var(--foreground)]">
                {content}
              </div>
              {txHash && (
                <p className="mt-2 truncate font-mono text-xs text-[var(--muted)]">tx: {txHash}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          {step === "done" ? (
            <Button className="flex-1" onClick={() => onSuccess(content ?? "")}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePay} loading={step === "paying"}>
                {step === "paying" ? "Processing..." : `Pay ${formatUSDC(Number(listing.price))}`}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
