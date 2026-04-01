import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CooperLogo } from "@/components/brand";

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
    "A playful digital marketplace for AI-native goods with x402 payments, Phantom wallets, and agent-driven purchasing.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-auto border-t border-[var(--border)] bg-white/40 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <CooperLogo compact iconClassName="h-10 w-10" />
              </div>
              <p className="text-xs text-[var(--muted)]">© 2025 Cooper ·</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                <span>Powered by</span>
                <span className="font-semibold text-[var(--accent-strong)]">
                  x402
                </span>
                <span>·</span>
                <span className="font-semibold text-[var(--success)]">
                  Phantom
                </span>
                <span>·</span>
                <span className="font-semibold text-sky-600">MoonPay OWS</span>
                <span>·</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
