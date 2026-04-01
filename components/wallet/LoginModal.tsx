"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { openPhantomLogin, connectExtension, isExtensionInstalled } from "@/lib/phantom";
import { CooperMascot } from "@/components/mascot/CooperMascot";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (address: string, method: "google" | "apple" | "phantom") => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.004 0c.07.85-.232 1.694-.762 2.334-.53.64-1.35 1.097-2.176 1.04-.092-.822.27-1.68.771-2.276C11.352.49 12.23.044 13.004 0zM15.75 12.54c-.39.85-.58 1.23-1.083 1.977-.703 1.062-1.694 2.384-2.927 2.395-1.092.01-1.373-.705-2.856-.697-1.483.009-1.791.71-2.89.7-1.233-.01-2.17-1.201-2.873-2.263C1.21 12.478.75 9.955 1.66 8.115c.653-1.34 1.884-2.12 3.09-2.12 1.15 0 1.873.706 2.822.706.922 0 1.484-.708 2.812-.708 1.075 0 2.172.586 2.822 1.6-2.478 1.358-2.076 4.898.544 5.947z"/>
  </svg>
);

const PhantomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="26" fill="#AB9FF2"/>
    <path d="M110.584 64.9141H99.142C99.142 41.8335 80.173 23.0713 56.8934 23.0713C33.8887 23.0713 15.1117 41.4423 14.6484 64.0866C14.1729 87.4605 34.6825 108 58.3329 108H63.7271C84.1379 108 111.986 91.9483 116.303 73.6813C117.391 69.0439 114.284 64.9141 110.584 64.9141ZM42.7808 64.9141C42.7808 68.9528 39.4836 72.2354 35.4265 72.2354C31.3694 72.2354 28.0723 68.9528 28.0723 64.9141C28.0723 60.8754 31.3694 57.5928 35.4265 57.5928C39.4836 57.5928 42.7808 60.8754 42.7808 64.9141ZM62.7631 64.9141C62.7631 68.9528 59.466 72.2354 55.4089 72.2354C51.3518 72.2354 48.0547 68.9528 48.0547 64.9141C48.0547 60.8754 51.3518 57.5928 55.4089 57.5928C59.466 57.5928 62.7631 60.8754 62.7631 64.9141Z" fill="white"/>
  </svg>
);

type LoginMethod = "google" | "apple" | "phantom";

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState<LoginMethod | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  async function handleSocial(provider: "google" | "apple") {
    setLoading(provider);
    try {
      await openPhantomLogin(provider);
      // The Phantom embedded widget handles auth — listen for address via SDK
      // For now close our modal so Phantom UI is visible
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function handlePhantom() {
    setLoading("phantom");
    try {
      if (isExtensionInstalled()) {
        const address = await connectExtension();
        onSuccess(address, "phantom");
        onClose();
      } else {
        // Fall back to embedded Phantom
        await openPhantomLogin();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  const modal = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_32px_60px_rgba(54,72,42,0.16)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 transition-colors hover:bg-black/5"
        >
          <X className="h-4 w-4 text-[var(--muted)]" />
        </button>

        {/* Mascot hero */}
        <div className="flex justify-center pt-6 pb-2">
          <CooperMascot size={150} animated variant="wave" />
        </div>

        <div className="px-8 pb-5 text-center">
          <h2 className="text-xl font-black tracking-[-0.05em] text-[var(--foreground)]">
            Welcome to Cooper
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Sign in to buy, sell, and run your agent</p>
        </div>

        <div className="px-6 pb-4 space-y-3">
          <button
            onClick={() => handleSocial("google")}
            disabled={!!loading}
            className="flex w-full items-center gap-3 rounded-[1.35rem] border border-[var(--border)] bg-white/88 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "google" ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-[var(--muted)]" />
            ) : (
              <GoogleIcon />
            )}
            <span className="flex-1 text-left text-sm font-semibold text-[var(--foreground)]">
              Continue with Google
            </span>
          </button>

          <button
            onClick={() => handleSocial("apple")}
            disabled={!!loading}
            className="flex w-full items-center gap-3 rounded-[1.35rem] border border-[var(--border)] bg-white/88 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "apple" ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-[var(--muted)]" />
            ) : (
              <span className="text-[var(--foreground)]">
                <AppleIcon />
              </span>
            )}
            <span className="flex-1 text-left text-sm font-semibold text-[var(--foreground)]">
              Continue with Apple
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            onClick={handlePhantom}
            disabled={!!loading}
            className="flex w-full items-center gap-3 rounded-[1.35rem] border border-orange-200 bg-orange-100/85 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "phantom" ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-[var(--accent-strong)]" />
            ) : (
              <PhantomIcon />
            )}
            <span className="flex-1 text-left text-sm font-semibold text-[var(--accent-strong)]">
              {isExtensionInstalled() ? "Connect Phantom Wallet" : "Continue with Phantom"}
            </span>
          </button>
        </div>

        <div className="px-6 pt-2 pb-6 flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--success)]" />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Powered by{" "}
            <span className="font-semibold text-[var(--foreground)]">Phantom embedded wallets</span>{" "}
            + <span className="font-semibold text-[var(--foreground)]">MoonPay OWS</span>. Your
            keys never leave your device.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
