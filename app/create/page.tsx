"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Plus, Image, FileText, Sparkles, Database, Package,
  Lock, ChevronRight, Upload, X as XIcon,
} from "lucide-react";
import { useAccounts, AddressType } from "@phantom/react-sdk";
import { Button } from "@/components/ui/Button";
import { CooperMascotSmall } from "@/components/mascot/CooperMascot";
import { LoginModal } from "@/components/wallet/LoginModal";
import type { ListingCategory } from "@/types";

// ── Per-category config ───────────────────────────────────────────────────────

const CATEGORIES: {
  value: ListingCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  desc: string;
}[] = [
  {
    value: "prompt",
    label: "Prompt",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    desc: "Sell a high-quality AI prompt",
  },
  {
    value: "research",
    label: "Research",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "Reports, analysis, alpha",
  },
  {
    value: "ai-image",
    label: "AI Image",
    icon: Image,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    desc: "Full-res AI-generated art",
  },
  {
    value: "dataset",
    label: "Dataset",
    icon: Database,
    color: "text-[var(--success)]",
    bg: "bg-[var(--success-soft)]",
    border: "border-[var(--success)]/30",
    desc: "Structured data & exports",
  },
  {
    value: "other",
    label: "Other",
    icon: Package,
    color: "text-[var(--muted)]",
    bg: "bg-white/70",
    border: "border-[var(--border)]",
    desc: "Any other digital content",
  },
];

// ── Form state shape ──────────────────────────────────────────────────────────

interface FormState {
  // Common
  title: string;
  description: string;
  price: string;
  category: ListingCategory;
  creatorName: string;
  previewUrl: string;

  // AI Image
  aiModel: string;
  resolution: string;
  styleTags: string;
  license: string;
  fullImageUrl: string; // gated

  // Research
  topic: string;
  coveragePeriod: string;
  pageCount: string;
  reportFormat: string;
  reportUrl: string; // gated

  // Prompt
  targetModels: string;
  useCase: string;
  sampleOutput: string;
  promptText: string; // gated

  // Dataset
  dataFormat: string;
  recordCount: string;
  dateRange: string;
  columnSchema: string;
  downloadUrl: string; // gated

  // Other
  fileType: string;
  contentUrl: string; // gated
}

const EMPTY: FormState = {
  title: "", description: "", price: "", category: "prompt",
  creatorName: "", previewUrl: "",
  aiModel: "", resolution: "", styleTags: "", license: "Personal use", fullImageUrl: "",
  topic: "", coveragePeriod: "", pageCount: "", reportFormat: "PDF", reportUrl: "",
  targetModels: "", useCase: "", sampleOutput: "", promptText: "",
  dataFormat: "CSV", recordCount: "", dateRange: "", columnSchema: "", downloadUrl: "",
  fileType: "", contentUrl: "",
};

// ── Build the gated content string ───────────────────────────────────────────

function buildContent(f: FormState): string {
  switch (f.category) {
    case "ai-image":
      return [
        `[AI Image]`,
        `Full-resolution URL: ${f.fullImageUrl}`,
        ``,
        `Model: ${f.aiModel}`,
        `Resolution: ${f.resolution}`,
        `Style: ${f.styleTags}`,
        `License: ${f.license}`,
      ].join("\n");

    case "research":
      return [
        `[Research Report]`,
        ``,
        f.reportUrl ? `Full report: ${f.reportUrl}` : "",
      ].filter(Boolean).join("\n");

    case "prompt":
      return [
        `[Prompt]`,
        `Works with: ${f.targetModels}`,
        `Use case: ${f.useCase}`,
        ``,
        f.promptText,
      ].join("\n");

    case "dataset":
      return [
        `[Dataset]`,
        `Download: ${f.downloadUrl}`,
        ``,
        `Format: ${f.dataFormat}`,
        `Records: ${f.recordCount}`,
        `Date range: ${f.dateRange}`,
        `Columns: ${f.columnSchema}`,
      ].join("\n");

    default:
      return f.contentUrl;
  }
}

// ── Shared input styles ───────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[1.1rem] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--success)] focus:ring-2 focus:ring-[var(--success)]/20 transition-all";

const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]";

const sectionCls =
  "rounded-[1.6rem] border border-[var(--border)] bg-white/60 p-6 space-y-5";

// ── Field components ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, required, type = "text",
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <input
      type={type} required={required} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 3, mono = false, required,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; mono?: boolean; required?: boolean;
}) {
  return (
    <textarea
      required={required} rows={rows} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-none${mono ? " font-mono" : ""}`}
    />
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

// ── Category-specific fields ──────────────────────────────────────────────────

function CategoryFields({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  switch (form.category) {
    case "ai-image":
      return (
        <>
          <Grid>
            <Field label="AI Model">
              <TextInput value={form.aiModel} onChange={(v) => set("aiModel", v)}
                placeholder="Midjourney v6, DALL-E 3, Flux…" />
            </Field>
            <Field label="Resolution">
              <TextInput value={form.resolution} onChange={(v) => set("resolution", v)}
                placeholder="2048×2048, 4K…" />
            </Field>
          </Grid>
          <Field label="Style Tags">
            <TextInput value={form.styleTags} onChange={(v) => set("styleTags", v)}
              placeholder="photorealistic, cinematic, neon, portrait…" />
          </Field>
          <Field label="License">
            <Select value={form.license} onChange={(v) => set("license", v)}
              options={["Personal use", "Commercial use", "Extended commercial"]} />
          </Field>
        </>
      );

    case "research":
      return (
        <>
          <Grid>
            <Field label="Topic / Domain">
              <TextInput value={form.topic} onChange={(v) => set("topic", v)}
                placeholder="DeFi, Solana, NFT market…" />
            </Field>
            <Field label="Coverage Period">
              <TextInput value={form.coveragePeriod} onChange={(v) => set("coveragePeriod", v)}
                placeholder="Q1 2025, Jan–Mar 2025…" />
            </Field>
          </Grid>
          <Grid>
            <Field label="Pages / Length">
              <TextInput value={form.pageCount} onChange={(v) => set("pageCount", v)}
                placeholder="24 pages" />
            </Field>
            <Field label="Format">
              <Select value={form.reportFormat} onChange={(v) => set("reportFormat", v)}
                options={["PDF", "Notion", "Google Doc", "Markdown", "Substack"]} />
            </Field>
          </Grid>
        </>
      );

    case "prompt":
      return (
        <>
          <Grid>
            <Field label="Works with">
              <TextInput value={form.targetModels} onChange={(v) => set("targetModels", v)}
                placeholder="GPT-4o, Claude 3.5, Gemini…" />
            </Field>
            <Field label="Use Case">
              <TextInput value={form.useCase} onChange={(v) => set("useCase", v)}
                placeholder="Marketing copy, code review…" />
            </Field>
          </Grid>
          <Field label="Sample Output (public teaser)">
            <Textarea value={form.sampleOutput} onChange={(v) => set("sampleOutput", v)}
              placeholder="Show buyers a short example of what this prompt produces…"
              rows={3} />
          </Field>
        </>
      );

    case "dataset":
      return (
        <>
          <Grid>
            <Field label="Format">
              <Select value={form.dataFormat} onChange={(v) => set("dataFormat", v)}
                options={["CSV", "JSON", "Parquet", "SQL", "XLSX", "Other"]} />
            </Field>
            <Field label="Records / Rows">
              <TextInput value={form.recordCount} onChange={(v) => set("recordCount", v)}
                placeholder="10,000 rows" />
            </Field>
          </Grid>
          <Field label="Date Range">
            <TextInput value={form.dateRange} onChange={(v) => set("dateRange", v)}
              placeholder="Jan 2024 – Dec 2024" />
          </Field>
          <Field label="Columns / Schema">
            <Textarea value={form.columnSchema} onChange={(v) => set("columnSchema", v)}
              placeholder="id, timestamp, price, volume, market_cap, chain…"
              rows={2} mono />
          </Field>
        </>
      );

    default:
      return (
        <Field label="Content Type / Format">
          <TextInput value={form.fileType} onChange={(v) => set("fileType", v)}
            placeholder="PDF, ZIP, MP4, Notion, Google Drive…" />
        </Field>
      );
  }
}

// ── Gated content section ─────────────────────────────────────────────────────

const GATED: Record<ListingCategory, { label: string; placeholder: string; mono?: boolean; textarea?: boolean }> = {
  "ai-image": {
    label: "Full-resolution image URL",
    placeholder: "https://storage.example.com/full-res.png",
  },
  "research": {
    label: "Full report URL",
    placeholder: "https://notion.so/… or Google Doc link",
  },
  "prompt": {
    label: "The full prompt",
    placeholder: "Act as a senior copywriter with 20 years of experience…",
    mono: true,
    textarea: true,
  },
  "dataset": {
    label: "Download URL",
    placeholder: "https://storage.example.com/dataset.csv",
  },
  "other": {
    label: "Content URL or text",
    placeholder: "Link or paste full content here…",
    textarea: true,
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const accounts = useAccounts();
  const address =
    accounts?.find((a) => a.addressType === AddressType.solana)?.address ??
    accounts?.[0]?.address ??
    null;

  const [loginOpen, setLoginOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Login gate ────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <CooperMascotSmall size={72} />
        <div>
          <h1 className="text-2xl font-black tracking-[-0.05em] text-[var(--foreground)]">
            Connect to create a listing
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You need a wallet to publish content on Cooper.
          </p>
        </div>
        <Button size="lg" onClick={() => setLoginOpen(true)}>
          <Lock className="h-4 w-4" />
          Connect Wallet
        </Button>
        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSuccess={() => setLoginOpen(false)}
        />
      </div>
    );
  }

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      set("previewUrl", data.url);
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  }

  const activeCat = CATEGORIES.find((c) => c.value === form.category)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const content = buildContent(form);
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description + (form.category === "prompt" && form.sampleOutput
            ? `\n\nSample output:\n${form.sampleOutput}` : ""),
          price: form.price,
          category: form.category,
          creatorName: form.creatorName,
          creatorAddress: address,
          previewUrl: form.previewUrl || null,
          content,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1800);
      }
    } finally {
      setLoading(false);
    }
  }

  const gated = GATED[form.category];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <CooperMascotSmall size={40} />
        <div>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--foreground)]">
            List your content
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Sell anything digital — paid instantly via x402 in USDC
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => s < step && setStep(s as 1 | 2)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                step === s
                  ? "bg-[var(--foreground)] text-white shadow-[0_4px_12px_rgba(40,58,30,0.20)]"
                  : step > s
                  ? "bg-[var(--success)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--muted)]"
              }`}
            >
              {step > s ? <Check className="h-3.5 w-3.5" /> : s}
            </button>
            <span className={`text-xs font-semibold ${step >= s ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              {s === 1 ? "Category & details" : "Gated content"}
            </span>
            {s < 2 && <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Category picker */}
            <div className={sectionCls}>
              <p className={labelCls}>What are you selling?</p>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => set("category", cat.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-[1.2rem] border px-3 py-3.5 text-center transition-all ${
                        active
                          ? `${cat.border} ${cat.bg} shadow-[0_8px_20px_rgba(0,0,0,0.08)]`
                          : "border-[var(--border)] bg-white/50 hover:bg-white"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? cat.color : "text-[var(--muted)]"}`} />
                      <span className={`text-[0.68rem] font-bold ${active ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Category description */}
              <div className={`flex items-center gap-2 rounded-xl ${activeCat.bg} px-3.5 py-2.5`}>
                <activeCat.icon className={`h-4 w-4 flex-shrink-0 ${activeCat.color}`} />
                <span className={`text-xs font-semibold ${activeCat.color}`}>{activeCat.desc}</span>
              </div>
            </div>

            {/* Common info */}
            <div className={sectionCls}>
              <p className={labelCls}>Basic info</p>
              <Field label="Title">
                <TextInput required value={form.title} onChange={(v) => set("title", v)}
                  placeholder={
                    form.category === "prompt" ? "10x Your Cold Email Response Rate" :
                    form.category === "research" ? "Solana DeFi Ecosystem Report Q1 2025" :
                    form.category === "ai-image" ? "Neon Cityscape 4K — Cinematic Series" :
                    form.category === "dataset" ? "Solana On-chain DEX Volume Jan–Dec 2024" :
                    "Name your listing"
                  }
                />
              </Field>
              <Field label="Description">
                <Textarea required value={form.description} onChange={(v) => set("description", v)}
                  placeholder="What will buyers get? What makes this valuable?"
                  rows={3}
                />
              </Field>
              <Grid>
                <Field label="Price (USDC)">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                    <input
                      type="number" required min="0.01" step="0.01"
                      placeholder="2.99" value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={`${inputCls} pl-8 pr-16`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">USDC</span>
                  </div>
                </Field>
                <Field label="Your display name">
                  <TextInput required value={form.creatorName} onChange={(v) => set("creatorName", v)}
                    placeholder="ResearchDAO, 0xAlpha…" />
                </Field>
              </Grid>
              <Field label="Preview image">
                <input
                  ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                />
                {form.previewUrl ? (
                  <div className="relative overflow-hidden rounded-[1.1rem] border border-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.previewUrl} alt="Preview" className="h-40 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { set("previewUrl", ""); if (fileRef.current) fileRef.current.value = ""; }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center gap-2 rounded-[1.1rem] border-2 border-dashed border-[var(--border)] bg-white/50 px-4 py-8 text-center transition-all hover:border-[var(--success)] hover:bg-[var(--success-soft)]/40 disabled:cursor-wait"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleImageUpload(f); }}
                  >
                    <Upload className={`h-6 w-6 ${uploading ? "animate-bounce text-[var(--success)]" : "text-[var(--muted)]"}`} />
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {uploading ? "Uploading…" : "Click or drag to upload"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">JPEG, PNG, WebP, GIF · max 4 MB</span>
                  </button>
                )}
                {uploadError && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{uploadError}</p>
                )}
              </Field>
            </div>

            {/* Category-specific public fields */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2">
                <activeCat.icon className={`h-4 w-4 ${activeCat.color}`} />
                <p className={`${labelCls} mb-0`}>{activeCat.label} details</p>
              </div>
              <CategoryFields form={form} set={set} />
            </div>

            <Button
              type="button" size="lg" className="w-full"
              onClick={() => setStep(2)}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── STEP 2 — Gated content ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className={sectionCls}>
              <div className="flex items-center gap-2.5 rounded-[1.1rem] border border-[var(--border)] bg-white/70 px-4 py-3">
                <Lock className="h-4 w-4 flex-shrink-0 text-[var(--accent-strong)]" />
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  This section is <span className="font-bold text-[var(--foreground)]">encrypted and hidden</span> — buyers only see it after successful payment.
                </p>
              </div>

              <Field label={gated.label}>
                {gated.textarea ? (
                  <Textarea
                    required value={form.category === "prompt" ? form.promptText : form.contentUrl}
                    onChange={(v) => set(form.category === "prompt" ? "promptText" : "contentUrl", v)}
                    placeholder={gated.placeholder} rows={8} mono={gated.mono}
                  />
                ) : (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <input
                      type={form.category === "prompt" ? "text" : "url"}
                      required
                      placeholder={gated.placeholder}
                      value={form.category === "ai-image" ? form.fullImageUrl :
                             form.category === "research" ? form.reportUrl :
                             form.category === "dataset" ? form.downloadUrl : form.contentUrl}
                      onChange={(e) => set(
                        form.category === "ai-image" ? "fullImageUrl" :
                        form.category === "research" ? "reportUrl" :
                        form.category === "dataset" ? "downloadUrl" : "contentUrl",
                        e.target.value
                      )}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                )}
              </Field>
            </div>

            {/* Summary card */}
            <div className="rounded-[1.6rem] border border-[var(--border)] bg-white/40 p-5 space-y-2">
              <p className={labelCls}>Listing summary</p>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[var(--foreground)] leading-snug">{form.title || "—"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full ${activeCat.bg} ${activeCat.border} border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${activeCat.color}`}>
                      {activeCat.label}
                    </span>
                    <span className="text-sm font-black text-[var(--accent-strong)]">${form.price || "0"} USDC</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] shrink-0">by {form.creatorName || "—"}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" size="lg"
                onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" size="lg" loading={loading} className="flex-[2]">
                {success ? (
                  <><Check className="h-4 w-4" /> Published! Redirecting…</>
                ) : (
                  <><Plus className="h-4 w-4" /> Publish listing</>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
