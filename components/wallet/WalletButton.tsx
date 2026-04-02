"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LoginModal } from "./LoginModal";
import { useWallet } from "@/lib/use-wallet";
import { shortenAddress } from "@/lib/utils";
import { LogOut, ChevronDown, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";

const OWSIcon = () => (
  <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#1a1a2e"/>
    <path d="M16 6C10.48 6 6 10.48 6 16s4.48 10 10 10 10-4.48 10-10S21.52 6 16 6zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#C8FF69"/>
  </svg>
);

export function WalletButton() {
  const { data: authSession, status } = useSession();
  const { session } = useWallet();
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch balance when dropdown opens
  async function fetchBalance() {
    if (!session?.userId) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/wallet?userId=${session.userId}`);
      const data = await res.json();
      if (res.ok) setUsdcBalance(data.usdcBalance ?? 0);
    } catch {}
    finally { setRefreshing(false); }
  }

  useEffect(() => {
    if (dropdownOpen && session?.userId) fetchBalance();
  }, [dropdownOpen, session?.userId]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleCopy() {
    if (!session?.walletAddress) return;
    navigator.clipboard.writeText(session.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (status === "loading") return null;

  if (!authSession) {
    return (
      <>
        <Button
          size="md"
          onClick={() => setLoginOpen(true)}
          className="px-6 py-2.5 text-sm font-bold shadow-[0_8px_22px_rgba(242,141,79,0.30)]"
        >
          Login
        </Button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--muted)]">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--success)] border-t-transparent" />
        Setting up wallet…
      </div>
    );
  }

  const user = authSession.user as any;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-[0_4px_18px_rgba(54,72,42,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(54,72,42,0.14)]"
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--success)] shadow-[0_0_6px_var(--success)]" />
        {user.image ? (
          <img src={user.image} alt="" className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <OWSIcon />
        )}
        {session.displayName?.split(" ")[0] ?? shortenAddress(session.walletAddress)}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform text-[var(--muted)] ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_40px_rgba(54,72,42,0.12)]">
          {/* User info */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            {user.image && (
              <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-[var(--foreground)]">{session.displayName}</p>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-[var(--muted)]">OWS Agent Wallet · Devnet</p>
            </div>
          </div>

          {/* USDC balance */}
          <div className="border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">USDC Balance</p>
              <button
                onClick={(e) => { e.stopPropagation(); fetchBalance(); }}
                className="rounded-lg p-1 transition-colors hover:bg-black/5"
              >
                <RefreshCw className={`h-3 w-3 text-[var(--muted)] ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            {usdcBalance === null ? (
              <div className="mt-1 h-5 w-16 animate-pulse rounded-full bg-[var(--border)]" />
            ) : (
              <p className="mt-0.5 text-lg font-black tracking-[-0.04em] text-[var(--success)]">
                {usdcBalance.toFixed(2)} <span className="text-xs font-bold text-[var(--muted)]">USDC</span>
              </p>
            )}
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 flex items-center gap-1 text-[0.65rem] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Get devnet USDC
            </a>
          </div>

          {/* Wallet address */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
            <span className="truncate font-mono text-xs text-[var(--muted)]">{session.walletAddress}</span>
            <button onClick={handleCopy} className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5">
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />}
            </button>
          </div>

          <button
            onClick={() => { signOut(); setDropdownOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
