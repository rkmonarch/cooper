"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CooperMascotSmall } from "@/components/mascot/CooperMascot";
import { WalletButton } from "@/components/wallet/WalletButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse" },
  { href: "/create", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agent", label: "Agent" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[#fffcf5]/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(54,72,42,0.07)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5rem] items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg]">
              <CooperMascotSmall size={48} />
            </div>
            <span className="hidden sm:block font-black text-[1.35rem] tracking-[-0.07em] text-[var(--foreground)]">
              Cooper
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-[var(--border)] bg-white/60 px-1.5 py-1.5 shadow-[0_2px_12px_rgba(54,72,42,0.06)] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  pathname === link.href
                    ? "bg-[var(--foreground)] text-white shadow-[0_4px_14px_rgba(40,58,30,0.22)]"
                    : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet / Login */}
          <WalletButton />

        </div>
      </div>
    </header>
  );
}
