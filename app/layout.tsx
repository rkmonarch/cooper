import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CooperMascotSmall } from "@/components/mascot/CooperMascot";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cooper — Playful Agent Commerce",
  description:
    "A playful digital marketplace for AI-native goods with x402 payments, OWS agent wallets, and agent-driven purchasing.",
  openGraph: {
    title: "Cooper",
    description:
      "A playful marketplace where autonomous buyers can safely shop",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-auto border-t border-[var(--border)] bg-white/40 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CooperMascotSmall size={36} />
                <span className="font-black tracking-[-0.05em] text-[var(--foreground)]">
                  Cooper
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Built by{" "}
                <a
                  href="https://github.com/rkmonarch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--foreground)] hover:text-[var(--accent-strong)] transition-colors"
                >
                  rkmonarch
                </a>{" "}
                · © 2026 Cooper
              </p>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
