import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Zap } from "lucide-react";
import { CooperLogo } from "@/components/brand";
import { CooperMascot } from "@/components/mascot/CooperMascot";
import { ListingsSection } from "@/components/marketplace/ListingsSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── HERO: full-bleed, asymmetric ───────────────────────────────────── */}
      <section className="relative min-h-[92vh] overflow-hidden">
        {/* Large decorative ring top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full border-[48px] border-[var(--success-soft)] opacity-60"
        />
        {/* Small filled circle bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-200/50"
        />

        <div className="relative mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 items-center gap-0 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* ── Left column: text ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-8 py-20 lg:py-0">
            {/* pill */}
            <div className="flex"></div>

            {/* headline — big, stacked, colorful words */}
            <div>
              <p className="mb-3 font-black text-[var(--muted)] text-lg tracking-[-0.02em]">
                A marketplace where
              </p>
              <h1 className="text-[clamp(3.2rem,8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.07em] text-[var(--foreground)]">
                agents
                <br />
                <span
                  className="relative inline-block"
                  style={{
                    WebkitTextStroke: "2px var(--accent)",
                    color: "transparent",
                  }}
                >
                  actually
                </span>
                <br />
                shop.
              </h1>
            </div>

            {/* sub */}
            <p className="max-w-md text-base leading-7 text-[var(--muted)]">
              Premium prompts, research, datasets, and AI images — bought in one
              click via{" "}
              <strong className="font-bold text-[var(--foreground)]">
                x402
              </strong>{" "}
              or handed off to an{" "}
              <strong className="font-bold text-[var(--foreground)]">
                autonomous agent
              </strong>{" "}
              with your policy baked in.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/#listings">
                <Button size="lg">
                  Browse listings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/agent">
                <Button variant="secondary" size="lg">
                  <Bot className="h-4 w-4" />
                  Run agent
                </Button>
              </Link>
            </div>

            {/* live stats strip */}
            <div className="flex items-center gap-6">
              {[
                { n: "x402", l: "payments" },
                { n: "OWS", l: "vault safety" },
                { n: "0", l: "key exposure" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl font-black tracking-[-0.06em] text-[var(--foreground)]">
                    {n}
                  </p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: mascot + floating chips ───────────────────────── */}
          <div className="relative flex items-center justify-center py-16 lg:py-0">
            {/* large soft ring behind mascot */}
            <div
              aria-hidden
              className="absolute h-[440px] w-[440px] rounded-full bg-[var(--success-soft)]/60"
            />

            {/* floating chips */}
            <div
              className="absolute left-0 top-16 z-10 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--foreground)] shadow-[0_12px_28px_rgba(54,72,42,0.10)]"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              Policy check ✓
            </div>

            <div
              className="absolute bottom-20 right-0 z-10 flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--accent-foreground)] shadow-[0_12px_28px_rgba(242,141,79,0.26)]"
              style={{ animation: "float 4.5s ease-in-out infinite 0.8s" }}
            >
              <Zap className="h-3.5 w-3.5" />
              2.50 USDC paid
            </div>

            <div
              className="absolute right-8 top-1/3 z-10 flex flex-col items-start rounded-[1.4rem] border border-[var(--border)] bg-white/88 px-4 py-3 text-[0.7rem] shadow-[0_14px_30px_rgba(54,72,42,0.09)]"
              style={{ animation: "float 5s ease-in-out infinite 1.6s" }}
            >
              <span className="font-black text-[var(--foreground)]">
                Agent bought
              </span>
              <span className="text-[var(--muted)]">Solana Research Q1 25</span>
            </div>

            <CooperMascot size={300} animated variant="wave" />
          </div>
        </div>

        {/* bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
      </section>

      {/* ─── HOW IT WORKS: horizontal scroll cards, no boring grid ─────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Under the hood
            </p>
            <h2 className="text-4xl font-black tracking-[-0.06em] text-[var(--foreground)] lg:text-5xl">
              Why it works.
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] underline decoration-dotted underline-offset-4 hover:text-[var(--foreground)] sm:block"
          >
            Set your policy →
          </Link>
        </div>

        {/* Three stacked/overlapping cards — each tilted differently */}
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* card 1 */}
          <div className="group relative flex-1 overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_24px_48px_rgba(54,72,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_56px_rgba(54,72,42,0.11)] lg:rotate-[-1.5deg] lg:group-hover:rotate-0">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-lime-200/60" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-lime-100">
              <ShieldCheck className="h-7 w-7 text-[var(--success)]" />
            </div>
            <h3 className="text-xl font-black tracking-[-0.05em] text-[var(--foreground)]">
              Keys inside Phantom only
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              MoonPay OWS encrypts and seals the wallet vault locally. Your
              agent gets a signed payload — never the key. Zero custody risk.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-lime-100/80 px-3 py-1 text-xs font-bold text-[var(--success)]">
              MoonPay OWS
            </div>
          </div>

          {/* card 2 — offset up on desktop */}
          <div className="group relative flex-1 overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_24px_48px_rgba(54,72,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_56px_rgba(54,72,42,0.11)] lg:mt-8 lg:rotate-[1deg] lg:group-hover:rotate-0">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-orange-200/50" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-orange-100">
              <Zap className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-black tracking-[-0.05em] text-[var(--foreground)]">
              x402 — one request, paid
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              A standard HTTP 402 response carries everything the client needs
              to pay. No redirects, no checkout flows, no gas fumbling. Just
              USDC on Base.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-bold text-[var(--accent-strong)]">
              Solana x402
            </div>
          </div>

          {/* card 3 */}
          <div className="group relative flex-1 overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_24px_48px_rgba(54,72,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_56px_rgba(54,72,42,0.11)] lg:rotate-[-0.8deg] lg:group-hover:rotate-0">
            <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-sky-200/50" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-sky-100">
              <Bot className="h-7 w-7 text-sky-600" />
            </div>
            <h3 className="text-xl font-black tracking-[-0.05em] text-[var(--foreground)]">
              Agent shops, you approve
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Give the agent a goal and a cap. It searches, checks your spending
              policy, and prompts Phantom biometrics when spend exceeds your
              threshold. Human still wins.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-bold text-sky-700">
              Phantom approval
            </div>
          </div>
        </div>
      </section>

      {/* ─── LISTINGS ────────────────────────────────────────────────────────── */}
      <section
        id="listings"
        className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
      >
        {/* Section label — big editorial style */}
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Marketplace
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[var(--foreground)]">
              Pick your pod.
            </h2>
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {(["ai-image", "research", "prompt", "dataset"] as const).map(
              (cat) => (
                <Badge key={cat} category={cat} />
              ),
            )}
          </div>
        </div>

        <ListingsSection />

        {/* CTA below grid */}
        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-[var(--muted)]">
            Got something worth selling?
          </p>
          <Link href="/create">
            <Button variant="secondary">List your content →</Button>
          </Link>
        </div>
      </section>

      {/* ─── TRUST STRIP ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] bg-white/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--muted)]">
            Built on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { name: "Phantom Embedded Wallet", color: "text-violet-600" },
              { name: "MoonPay Open Wallet Standard", color: "text-sky-600" },
              { name: "Solana x402", color: "text-blue-600" },
            ].map(({ name, color }) => (
              <span
                key={name}
                className={`text-sm font-black tracking-[-0.02em] ${color}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
