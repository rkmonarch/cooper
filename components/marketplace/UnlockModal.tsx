"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Lock, Unlock, ShieldCheck, Zap, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useSolana, useAccounts, useAutoConfirm, usePhantom, AddressType } from "@phantom/react-sdk";
import { NetworkId } from "@phantom/browser-sdk";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatUSDC } from "@/lib/utils";
import { checkPolicy, loadPolicy, recordSpend } from "@/lib/policy";
import { buildUsdcTransferTx, preflightCheck, DEVNET_CONNECTION } from "@/lib/solana-payment";
import { VersionedTransaction } from "@solana/web3.js";
import type { Listing } from "@/types";

interface UnlockModalProps {
  listing: Listing;
  open: boolean;
  onClose: () => void;
  onSuccess: (content: string) => void;
}

type Step = "policy" | "confirm" | "signing" | "confirming" | "done" | "error";

export function UnlockModal({ listing, open, onClose, onSuccess }: UnlockModalProps) {
  const router = useRouter();
  const { solana } = useSolana();
  const autoConfirm = useAutoConfirm();
  const sdk = usePhantom();
  const accounts = useAccounts();
  const buyerAddress =
    accounts?.find((a) => a.addressType === AddressType.solana)?.address ??
    accounts?.[0]?.address ??
    null;

  const [step, setStep] = useState<Step>("confirm");
  const [content, setContent] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Evaluate policy and set initial step on open
  useEffect(() => {
    if (!open) return;
    setContent(null);
    setTxSig(null);
    setError(null);

    const policy = loadPolicy();
    const check = checkPolicy(Number(listing.price), listing.category, policy);

    if (!check.allowed) {
      setError(check.reason);
      setStep("error");
    } else if (check.requiresApproval) {
      // Above requireApprovalAbove — show confirmation screen
      setStep("confirm");
    } else {
      // Within policy and under threshold — one-tap: go straight to signing
      setStep("policy");
    }
  }, [open, listing]);

  // Auto-fire payment when step === "policy" (one-tap flow)
  useEffect(() => {
    if (open && step === "policy" && mounted) {
      handlePay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, mounted]);

  async function handlePay() {
    if (!buyerAddress) {
      setError("Connect your wallet first.");
      setStep("error");
      return;
    }

    const recipient = listing.creatorAddress;
    if (!recipient || recipient === "anonymous") {
      setError("This listing has no creator address to send payment to.");
      setStep("error");
      return;
    }

    setStep("signing");
    setError(null);

    const policy = loadPolicy();
    const check = checkPolicy(Number(listing.price), listing.category, policy);
    const useAgentWallet = check.allowed && !check.requiresApproval;
    let autoConfirmEnabled = false;

    // Detect embedded vs injected wallet
    const providerInfo = sdk?.sdk?.getCurrentProviderInfo?.();
    const isEmbedded = providerInfo?.type === "embedded";

    try {
      // 1. Enable OWS auto-confirm for agent-wallet one-tap flow
      if (useAgentWallet) {
        try {
          await autoConfirm.enable({ chains: [NetworkId.SOLANA_DEVNET] });
          autoConfirmEnabled = true;
        } catch {
          // Auto-confirm not available (e.g. injected wallet) — proceed normally
        }
      }

      // 2. For injected wallets, switch to devnet explicitly
      if (!isEmbedded && (solana as any).switchNetwork) {
        try {
          await (solana as any).switchNetwork("devnet");
        } catch {
          // switchNetwork may not be available on all providers
        }
      }

      // 3. Pre-flight: verify buyer has enough devnet USDC + SOL
      await preflightCheck(buyerAddress, recipient, Number(listing.price));

      // 4. Build VersionedTransaction (v0) with idempotent ATA creation
      const tx = await buildUsdcTransferTx(
        buyerAddress,
        recipient,
        Number(listing.price),
      );

      let signature: string;

      if (isEmbedded) {
        // Embedded wallets only support signAndSendTransaction (not signTransaction).
        // The embedded wallet is scoped to devnet so it broadcasts there automatically.
        const result = await solana.signAndSendTransaction(tx);
        signature = result.signature;
      } else {
        // Injected extension: sign without broadcast, then send to devnet ourselves
        // so the tx always lands on devnet regardless of which network the extension
        // has selected.
        const signed = await solana.signTransaction(tx);
        signature = await DEVNET_CONNECTION.sendRawTransaction(
          (signed as VersionedTransaction).serialize(),
          { skipPreflight: false, preflightCommitment: "confirmed" },
        );

        const { blockhash: confirmBlockhash, lastValidBlockHeight } =
          await DEVNET_CONNECTION.getLatestBlockhash("confirmed");
        await DEVNET_CONNECTION.confirmTransaction(
          { signature, blockhash: confirmBlockhash, lastValidBlockHeight },
          "confirmed",
        );
      }

      setTxSig(signature);
      setStep("confirming");

      // Small buffer for RPC propagation
      await new Promise((r) => setTimeout(r, 500));

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerAddress,
          txSignature: signature,
          isAgent: useAgentWallet,
          policySnapshot: policy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        setStep("error");
        return;
      }

      // 6. Record spend in local daily tracker
      recordSpend(Number(listing.price));

      setContent(data.content);
      setStep("done");

      // 7. Redirect to the content page after a brief success moment
      setTimeout(() => {
        onSuccess(data.content);
        router.push(`/content/${listing.id}`);
      }, 1200);
    } catch (err: any) {
      const msg: string = err?.message ?? "Payment failed.";
      setError(
        msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("cancel")
          ? "You cancelled the transaction in Phantom."
          : msg,
      );
      setStep("error");
    } finally {
      // Always disable auto-confirm after the transaction
      if (autoConfirmEnabled) {
        autoConfirm.disable().catch(() => {});
      }
    }
  }

  if (!open || !mounted) return null;

  const price = Number(listing.price);
  const categoryEmoji =
    listing.category === "ai-image" ? "🎨"
    : listing.category === "research" ? "📄"
    : listing.category === "prompt" ? "✨"
    : listing.category === "dataset" ? "📊"
    : "📦";

  const modal = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.30)", backdropFilter: "blur(5px)" }}
        onClick={step === "signing" || step === "confirming" ? undefined : onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_40px_80px_rgba(54,72,42,0.22)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <div className="flex items-center gap-2">
            {step === "done"  && <Unlock         className="h-5 w-5 text-[var(--success)]" />}
            {step === "error" && <AlertTriangle   className="h-5 w-5 text-red-500" />}
            {!["done","error"].includes(step) && <Lock className="h-5 w-5 text-[var(--accent-strong)]" />}
            <h2 className="font-black tracking-[-0.03em] text-[var(--foreground)]">
              {step === "done"  ? "Content Unlocked!"
               : step === "error" ? "Cannot Unlock"
               : "Unlock Content"}
            </h2>
          </div>
          {step !== "signing" && step !== "confirming" && (
            <button onClick={onClose} className="rounded-xl p-1.5 transition-colors hover:bg-black/5">
              <X className="h-4 w-4 text-[var(--muted)]" />
            </button>
          )}
        </div>

        <div className="space-y-4 p-6">

          {/* Listing card — shown except when done */}
          {step !== "done" && (
            <div className="flex items-start gap-3 rounded-[1.35rem] bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(89,124,67,0.1)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-100 to-orange-100 text-xl">
                {categoryEmoji}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">{listing.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{listing.description}</p>
                <Badge category={listing.category} className="mt-1.5" />
              </div>
            </div>
          )}

          {/* One-tap policy notice */}
          {step === "policy" && (
            <div className="flex items-center gap-2 rounded-[1rem] border border-lime-200 bg-lime-50/80 px-4 py-3 text-xs text-[var(--success)]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Within your spending policy — paying automatically…</span>
            </div>
          )}

          {/* Confirmation step */}
          {step === "confirm" && (
            <>
              <div className="flex items-center justify-between rounded-[1.35rem] border border-orange-200 bg-orange-100/75 p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--accent-strong)]">
                  <Zap className="h-4 w-4" />
                  <span>x402 · Solana devnet USDC</span>
                </div>
                <span className="text-lg font-black tracking-[-0.04em] text-[var(--accent-strong)]">
                  {formatUSDC(price)}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                <span>
                  This amount is above your auto-approve threshold. Phantom will prompt for approval.
                  Your keys never leave your wallet.
                </span>
              </div>
            </>
          )}

          {/* Signing / confirming */}
          {(step === "signing" || step === "confirming") && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)]">
                <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--success)] border-t-transparent" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {step === "signing" ? "Waiting for Phantom approval…" : "Confirming on Solana devnet…"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {step === "signing"
                  ? "Approve the USDC transfer in Phantom."
                  : "Transaction submitted — verifying on-chain…"}
              </p>
              {txSig && (
                <a
                  href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--success)] underline underline-offset-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Solana Explorer
                </a>
              )}
            </div>
          )}

          {/* Error */}
          {step === "error" && error && (
            <div className="rounded-[1rem] border border-red-100 bg-red-50 p-4 space-y-1.5">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              {(error.includes("daily limit") || error.includes("per-tx") || error.includes("Category")) && (
                <a href="/dashboard" className="block text-xs font-bold text-red-500 underline underline-offset-2">
                  Update your policy in Dashboard →
                </a>
              )}
              {error.includes("faucet.circle.com") && (
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="block text-xs font-bold text-red-500 underline underline-offset-2">
                  Open faucet.circle.com →
                </a>
              )}
            </div>
          )}

          {/* Success */}
          {step === "done" && content && (
            <div className="space-y-3">
              <div className="max-h-52 overflow-y-auto rounded-[1.2rem] bg-[var(--success-soft)] p-4 font-mono text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                {content}
              </div>
              {txSig && (
                <a
                  href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--success)] underline underline-offset-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on Solana Explorer
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          {step === "done" && (
            <Button className="flex-1" onClick={() => onSuccess(content ?? "")}>
              Done
            </Button>
          )}
          {step === "confirm" && (
            <>
              <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={handlePay}>
                <Zap className="h-3.5 w-3.5" />
                Pay {formatUSDC(price)}
              </Button>
            </>
          )}
          {step === "error" && (
            <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
