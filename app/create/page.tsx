"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CooperMascotSmall } from "@/components/mascot/CooperMascot";
import type { ListingCategory } from "@/types";

const categories: { value: ListingCategory; label: string; emoji: string }[] = [
  { value: "ai-image", label: "AI Image", emoji: "🎨" },
  { value: "research", label: "Research", emoji: "📄" },
  { value: "prompt", label: "Prompt", emoji: "✨" },
  { value: "dataset", label: "Dataset", emoji: "📊" },
  { value: "other", label: "Other", emoji: "📦" },
];

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "prompt" as ListingCategory,
    creatorName: "",
    content: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <CooperMascotSmall size={40} />
        <div>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--foreground)]">
            Create a Listing
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            List your digital content and earn USDC via x402 payments
          </p>
        </div>
      </div>

      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,245,224,0.9))]">
        <CardHeader>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            Listing Details
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Solana DeFi Research Report Q1 2025"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full rounded-[1.2rem] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="What will buyers get? What makes this valuable?"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full resize-none rounded-[1.2rem] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => set("category", cat.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                      form.category === cat.value
                        ? "border-[var(--success)] bg-[var(--success)] text-white shadow-[0_14px_28px_rgba(94,166,72,0.22)]"
                        : "border-[var(--border)] bg-white/70 text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-white"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Price (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="2.99"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="w-full rounded-[1.2rem] py-3 pl-8 pr-16 text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  USDC
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Your display name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ResearchDAO"
                value={form.creatorName}
                onChange={(e) => set("creatorName", e.target.value)}
                className="w-full rounded-[1.2rem] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Content{" "}
                <span className="normal-case tracking-normal font-normal text-[var(--muted)]">
                  (hidden until purchased)
                </span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste your content here — it will only be revealed after payment..."
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className="w-full resize-none rounded-[1.2rem] px-4 py-3 font-mono text-sm"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {success ? (
                <>
                  <Check className="h-4 w-4" />
                  Listed! Redirecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
