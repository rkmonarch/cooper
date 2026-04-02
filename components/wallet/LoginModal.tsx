"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { CooperMascot } from "@/components/mascot/CooperMascot";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!open) setLoading(false); }, [open]);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: window.location.href });
    // Page will redirect — no need to setLoading(false)
  }

  if (!open || !mounted) return null;

  const modal = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)" }}
        onClick={!loading ? onClose : undefined}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_32px_64px_rgba(54,72,42,0.18)]">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 transition-colors hover:bg-black/6 disabled:opacity-40"
        >
          <X className="h-4 w-4 text-[var(--muted)]" />
        </button>

        <div className="flex justify-center pt-6 pb-2">
          <CooperMascot size={150} animated variant="wave" />
        </div>

        <div className="px-8 pb-5 text-center">
          <h2 className="text-xl font-black tracking-[-0.05em] text-[var(--foreground)]">Welcome to Cooper</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Sign in to get your OWS agent wallet</p>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center gap-3 rounded-[1.35rem] border border-[var(--border)] bg-white/88 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-[var(--muted)]" />
            ) : (
              <GoogleIcon />
            )}
            <span className="flex-1 text-left text-sm font-semibold text-[var(--foreground)]">
              {loading ? "Redirecting to Google…" : "Continue with Google"}
            </span>
          </button>
        </div>

        <div className="px-6 pt-2 pb-6 flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--success)]" />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Powered by{" "}
            <span className="font-semibold text-[var(--foreground)]">MoonPay OWS</span>
            {" "}— your Google account deterministically derives your agent wallet. Same account, same wallet, always.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
