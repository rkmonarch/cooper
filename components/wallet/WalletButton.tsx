"use client";

import { useState, useEffect, useRef } from "react";
import { useAccounts, useDisconnect, AddressType } from "@phantom/react-sdk";
import { Button } from "@/components/ui/Button";
import { LoginModal } from "./LoginModal";
import { shortenAddress } from "@/lib/utils";
import { LogOut, ChevronDown, Copy, Check } from "lucide-react";

const PhantomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="26" fill="#AB9FF2"/>
    <path d="M110.584 64.9141H99.142C99.142 41.8335 80.173 23.0713 56.8934 23.0713C33.8887 23.0713 15.1117 41.4423 14.6484 64.0866C14.1729 87.4605 34.6825 108 58.3329 108H63.7271C84.1379 108 111.986 91.9483 116.303 73.6813C117.391 69.0439 114.284 64.9141 110.584 64.9141ZM42.7808 64.9141C42.7808 68.9528 39.4836 72.2354 35.4265 72.2354C31.3694 72.2354 28.0723 68.9528 28.0723 64.9141C28.0723 60.8754 31.3694 57.5928 35.4265 57.5928C39.4836 57.5928 42.7808 60.8754 42.7808 64.9141ZM62.7631 64.9141C62.7631 68.9528 59.466 72.2354 55.4089 72.2354C51.3518 72.2354 48.0547 68.9528 48.0547 64.9141C48.0547 60.8754 51.3518 57.5928 55.4089 57.5928C59.466 57.5928 62.7631 60.8754 62.7631 64.9141Z" fill="white"/>
  </svg>
);

export function WalletButton() {
  const accounts = useAccounts();
  const { disconnect } = useDisconnect();
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pull the Solana address from the SDK — automatically updates after any login method
  const address =
    accounts?.find((a) => a.addressType === AddressType.solana)?.address ??
    accounts?.[0]?.address ??
    null;

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleDisconnect() {
    await disconnect().catch(() => {});
    setDropdownOpen(false);
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Not connected → Login button
  if (!address) {
    return (
      <>
        <Button
          size="md"
          onClick={() => setLoginOpen(true)}
          className="px-6 py-2.5 text-sm font-bold shadow-[0_8px_22px_rgba(242,141,79,0.30)]"
        >
          Login
        </Button>
        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSuccess={() => setLoginOpen(false)}
        />
      </>
    );
  }

  // Connected → address chip + dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-[0_4px_18px_rgba(54,72,42,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(54,72,42,0.14)]"
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--success)] shadow-[0_0_6px_var(--success)]" />
        <PhantomIcon />
        {shortenAddress(address)}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform text-[var(--muted)] ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_40px_rgba(54,72,42,0.12)]">
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <span className="truncate font-mono text-xs text-[var(--muted)]">{address}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
              )}
            </button>
          </div>

          <hr className="mx-2 border-[var(--border)]" />

          <button
            onClick={handleDisconnect}
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
