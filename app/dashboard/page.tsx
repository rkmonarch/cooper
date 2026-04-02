"use client";

import { useState, useEffect } from "react";
import { Clock, Info, Save, Settings, ShieldCheck, TrendingUp, Wallet, Bot, Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useWallet } from "@/lib/use-wallet";
import type { ListingCategory, Policy } from "@/types";

const DEFAULT_POLICY: Policy = {
  dailyLimit: 50,
  maxPerTransaction: 10,
  allowedCategories: [],
  requireApprovalAbove: 5,
};

const ALL_CATEGORIES: ListingCategory[] = ["ai-image", "research", "prompt", "dataset", "other"];

export default function DashboardPage() {
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [saved, setSaved] = useState(false);
  const { session } = useWallet();
  const [balances, setBalances] = useState<{ solBalance: number; usdcBalance: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session?.userId) return;
    fetch(`/api/wallet?userId=${session.userId}`)
      .then((r) => r.json())
      .then((d) => setBalances({ solBalance: d.solBalance, usdcBalance: d.usdcBalance }))
      .catch(() => {});
  }, [session?.userId]);

  function handleCopy() {
    if (!session?.walletAddress) return;
    navigator.clipboard.writeText(session.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function savePolicy() {
    localStorage.setItem("cooper_policy", JSON.stringify(policy));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleCategory(cat: ListingCategory) {
    setPolicy((p) => ({
      ...p,
      allowedCategories: p.allowedCategories.includes(cat)
        ? p.allowedCategories.filter((c) => c !== cat)
        : [...p.allowedCategories, cat],
    }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">Manage your wallet, policies and history</p>
        </div>
        <WalletButton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--accent-strong)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Wallet</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session ? (
                <>
                  <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-white/70">
                    <p className="border-b border-[var(--border)] px-4 py-2 text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                      OWS Agent Wallet · Solana Devnet
                    </p>
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <span className="truncate font-mono text-xs text-[var(--foreground)]">{session.walletAddress}</span>
                      <button onClick={handleCopy} className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5">
                        {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--muted)]" />}
                      </button>
                    </div>
                  </div>
                  {balances && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/70 p-3 text-center">
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">SOL</p>
                        <p className="mt-0.5 text-sm font-black text-[var(--foreground)]">{balances.solBalance.toFixed(4)}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-lime-200 bg-lime-50 p-3 text-center">
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--success)]">USDC</p>
                        <p className="mt-0.5 text-sm font-black text-[var(--success)]">{balances.usdcBalance.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  <a
                    href="https://faucet.circle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[1.2rem] border border-[var(--border)] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[var(--muted)] transition-all hover:text-[var(--foreground)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Fund with devnet USDC
                  </a>
                </>
              ) : (
                <p className="text-sm text-[var(--muted)]">Log in to see your wallet.</p>
              )}
              <div className="rounded-[1.4rem] border border-lime-200 bg-lime-100/65 p-4">
                <div className="mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-[var(--success)]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--success)]">OWS Vault Active</p>
                </div>
                <p className="text-xs text-[var(--muted)]">Keys stay local. Agents only operate inside your policy.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[var(--accent-strong)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Spending Policy</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Info className="h-3 w-3" />
                <span>Controls what agents can spend</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Daily Limit</label>
                  <span className="text-xs font-black text-[var(--accent-strong)]">{policy.dailyLimit} USDC</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={policy.dailyLimit}
                  onChange={(e) => setPolicy((p) => ({ ...p, dailyLimit: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent)]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--muted)]/70">
                  <span>1 USDC</span>
                  <span>200 USDC</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Max Per Transaction</label>
                  <span className="text-xs font-black text-[var(--accent-strong)]">{policy.maxPerTransaction} USDC</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={policy.maxPerTransaction}
                  onChange={(e) => setPolicy((p) => ({ ...p, maxPerTransaction: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Manual Approval Above</label>
                  <span className="text-xs font-black text-[var(--success)]">{policy.requireApprovalAbove} USDC</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={policy.requireApprovalAbove}
                  onChange={(e) => setPolicy((p) => ({ ...p, requireApprovalAbove: Number(e.target.value) }))}
                  className="w-full accent-[var(--success)]"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Transactions above this amount will show a confirmation dialog.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Allowed Categories <span className="normal-case tracking-normal font-normal">(empty = all allowed)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={policy.allowedCategories.includes(cat) ? "" : "opacity-55"}
                    >
                      <Badge category={cat} />
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={savePolicy} variant="secondary" className="w-full">
                <Save className="h-3.5 w-3.5" />
                {saved ? "Saved!" : "Save Policy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── OWS Agent Wallet ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[var(--accent-strong)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Agent Wallet (OWS)</h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold text-[var(--success)]">
              <ShieldCheck className="h-3 w-3" />
              Active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Purchases within your spending policy are auto-confirmed by your OWS agent wallet — no browser extension needed. The wallet signs transactions server-side using{" "}
            <span className="font-semibold text-[var(--foreground)]">@open-wallet-standard/core</span>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--accent-strong)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Transaction History</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-[var(--muted)]">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-35" />
            <p className="text-sm font-semibold text-[var(--foreground)]">No transactions yet</p>
            <p className="mt-1 text-xs">Your x402 payment history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
