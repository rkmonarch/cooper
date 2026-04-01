"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CooperMascotSmall } from "@/components/mascot/CooperMascot";
import { WalletButton } from "@/components/wallet/WalletButton";

const navLinks = [
  { href: "/", label: "Marketplace" },
  { href: "/create", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agent", label: "Agent" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[#fff6e5]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5.25rem] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <CooperMascotSmall size={52} />
            </div>
            <span className="hidden sm:block font-black text-xl tracking-[-0.06em] text-[var(--foreground)]">
              Cooper
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  pathname === link.href
                    ? "bg-[var(--success-soft)] text-[var(--foreground)] shadow-[0_8px_18px_rgba(94,166,72,0.12)]"
                    : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--foreground)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
