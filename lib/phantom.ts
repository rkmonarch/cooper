"use client";

import { createPhantom, type Phantom } from "@phantom/wallet-sdk";

export type PhantomExtensionProvider = {
  isPhantom: boolean;
  publicKey: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array, encoding: "utf8"): Promise<{ signature: Uint8Array }>;
};

// ── Browser extension helpers ─────────────────────────────────────────────────

export function getExtensionProvider(): PhantomExtensionProvider | null {
  if (typeof window === "undefined") return null;
  const p = (window as any).phantom?.solana;
  return p?.isPhantom ? p : null;
}

export function isExtensionInstalled(): boolean {
  return getExtensionProvider() !== null;
}

export async function connectExtension(): Promise<string> {
  const provider = getExtensionProvider();
  if (!provider) throw new Error("Phantom extension not installed");
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

export async function disconnectExtension(): Promise<void> {
  const provider = getExtensionProvider();
  if (provider) await provider.disconnect();
}

// ── Embedded wallet (Phantom Connect SDK) ────────────────────────────────────

let _phantom: Phantom | null = null;

export async function getPhantomSDK(): Promise<Phantom> {
  if (_phantom) return _phantom;
  _phantom = await createPhantom({
    zIndex: 10000,
    hideLauncherBeforeOnboarded: true,
    colorScheme: "light",
  });
  return _phantom;
}

export async function openPhantomLogin(provider?: "google" | "apple"): Promise<void> {
  const phantom = await getPhantomSDK();
  if (provider) {
    // Navigate to social login onboarding
    phantom.navigate({ route: "onboarding", params: { socialProvider: provider } });
  }
  phantom.show();
}

export async function getEmbeddedAddress(): Promise<string | null> {
  const phantom = await getPhantomSDK();
  const solana = phantom.solana;
  if (!solana) return null;
  try {
    const resp = await solana.connect({ onlyIfTrusted: true });
    return resp?.publicKey?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function disconnectEmbedded(): Promise<void> {
  const phantom = await getPhantomSDK();
  try {
    await phantom.solana?.disconnect?.();
  } catch {}
}
