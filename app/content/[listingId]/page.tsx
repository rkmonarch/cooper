"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download, Copy, Check, ExternalLink, ArrowLeft,
  Image as ImageIcon, FileText, Sparkles, Database, Package,
  Lock, Loader2, ShieldCheck,
} from "lucide-react";
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatUSDC, shortenAddress } from "@/lib/utils";
import { parseContent, suggestFilename } from "@/lib/parse-content";
import type { ParsedContent } from "@/lib/parse-content";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentData {
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    previewUrl?: string;
    creatorName: string;
    creatorAddress: string;
    price: string;
    allowDownload: boolean;
  };
  content: string;
  payment: { txHash: string; paidAt: string };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const router = useRouter();
  const { session } = useWallet();
  const buyer = session?.walletAddress ?? null;

  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buyer) return;
    fetch(`/api/content/${listingId}?buyer=${buyer}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load content."))
      .finally(() => setLoading(false));
  }, [listingId, buyer]);

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!buyer && !loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Lock className="h-10 w-10 text-[var(--muted)]" />
        <p className="font-black text-lg text-[var(--foreground)]">Connect your wallet to view this content.</p>
        <Button variant="secondary" onClick={() => router.push("/listings")}>
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-strong)]" />
      </div>
    );
  }

  // ── Error (not paid / not found) ──────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Lock className="h-10 w-10 text-red-400" />
        <div>
          <p className="font-black text-lg text-[var(--foreground)]">Content locked</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{error ?? "You need to purchase this listing first."}</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/listings")}>
          <ArrowLeft className="h-4 w-4" /> Browse listings
        </Button>
      </div>
    );
  }

  const parsed = parseContent(data.listing.category, data.content);
  const filename = suggestFilename(data.listing.title, parsed);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => router.push("/listings")}
        className="mb-7 flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </button>

      {/* Header */}
      <div className="mb-8 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge category={data.listing.category as any} />
          <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--success)]">
            Purchased
          </span>
        </div>
        {/* Title row + action buttons on the right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--foreground)]">
            {data.listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <ContentActions parsed={parsed} filename={filename} allowDownload={data.listing.allowDownload ?? true} />
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">{data.listing.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
          <span>by <span className="font-mono font-bold text-[var(--foreground)]">{data.listing.creatorName}</span></span>
          <span>{formatUSDC(Number(data.listing.price))} paid</span>
          <a
            href={`https://explorer.solana.com/tx/${data.payment.txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--success)] underline underline-offset-2"
          >
            <ShieldCheck className="h-3 w-3" />
            Verified on-chain
          </a>
        </div>
      </div>

      {/* ── Content renderer ─────────────────────────────────────────── */}
      <ContentRenderer parsed={parsed} title={data.listing.title} filename={filename} previewUrl={data.listing.previewUrl} allowDownload={data.listing.allowDownload ?? true} />
    </div>
  );
}

// ── Shared layout ─────────────────────────────────────────────────────────────

function ContentLayout({
  meta,
  viewer,
}: {
  meta: [string, string][];
  viewer: React.ReactNode;
}) {
  const visibleMeta = meta.filter(([, v]) => v);
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left: details sidebar */}
      {visibleMeta.length > 0 && (
        <aside className="w-full shrink-0 lg:w-60">
          <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-white/70">
            <p className="border-b border-[var(--border)] px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.15em] text-[var(--muted)]">
              Details
            </p>
            {visibleMeta.map(([label, value]) => (
              <div key={label} className="border-b border-[var(--border)] last:border-b-0 px-4 py-3 space-y-0.5">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
                <p className="text-sm text-[var(--foreground)] break-words">{value}</p>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Right: viewer fills remaining space */}
      <div className="min-w-0 flex-1">{viewer}</div>
    </div>
  );
}

// ── Action buttons (rendered in header title row) ─────────────────────────────

function ContentActions({
  parsed,
  filename,
  allowDownload,
}: {
  parsed: ParsedContent;
  filename: string;
  allowDownload: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const p = parsed as any;

  if (parsed.type === "ai-image") {
    const imgUrl: string = p.fullImageUrl;
    async function dl() {
      setDownloading(true);
      try {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      } catch { window.open(imgUrl, "_blank"); }
      finally { setDownloading(false); }
    }
    return (<>
      {allowDownload && <Button onClick={dl} loading={downloading}><Download className="h-4 w-4" />Download image</Button>}
      <a href={imgUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary"><ExternalLink className="h-4 w-4" />Open original</Button></a>
    </>);
  }

  if (parsed.type === "research") {
    const reportUrl: string = p.reportUrl;
    return (<>
      {allowDownload && <a href={reportUrl} target="_blank" rel="noopener noreferrer" download={filename}><Button><Download className="h-4 w-4" />Download report</Button></a>}
      <a href={reportUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary"><ExternalLink className="h-4 w-4" />Open in new tab</Button></a>
    </>);
  }

  if (parsed.type === "prompt") {
    const promptText: string = p.promptText;
    function copy() { navigator.clipboard.writeText(promptText); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    function dlTxt() { const blob = new Blob([promptText], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
    return (<>
      <Button onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy prompt"}</Button>
      {allowDownload && <Button variant="secondary" onClick={dlTxt}><Download className="h-4 w-4" />Download .txt</Button>}
    </>);
  }

  if (parsed.type === "dataset") {
    const downloadUrl: string = p.downloadUrl;
    return (<>
      {allowDownload && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download><Button><Download className="h-4 w-4" />Download dataset</Button></a>}
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary"><ExternalLink className="h-4 w-4" />Open link</Button></a>
    </>);
  }

  // other
  const rawText: string = p.raw ?? "";
  const contentUrl: string | undefined = p.url;
  function copyRaw() { navigator.clipboard.writeText(rawText); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  function dlTxt() { const blob = new Blob([rawText], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename + ".txt"; a.click(); URL.revokeObjectURL(url); }
  return (<>
    {contentUrl && <a href={contentUrl} target="_blank" rel="noopener noreferrer"><Button><ExternalLink className="h-4 w-4" />Open content</Button></a>}
    <Button onClick={copyRaw}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy text"}</Button>
    {allowDownload && <Button variant="secondary" onClick={dlTxt}><Download className="h-4 w-4" />Download .txt</Button>}
  </>);
}

// ── Category renderers ────────────────────────────────────────────────────────

function ContentRenderer({
  parsed,
  title,
  filename,
  previewUrl,
  allowDownload,
}: {
  parsed: ParsedContent;
  title: string;
  filename: string;
  previewUrl?: string;
  allowDownload: boolean;
}) {
  switch (parsed.type) {
    case "ai-image":
      return <AiImageContent parsed={parsed} filename={filename} allowDownload={allowDownload} />;
    case "research":
      return <ResearchContent parsed={parsed} filename={filename} allowDownload={allowDownload} />;
    case "prompt":
      return <PromptContent parsed={parsed} title={title} filename={filename} allowDownload={allowDownload} />;
    case "dataset":
      return <DatasetContent parsed={parsed} allowDownload={allowDownload} />;
    default:
      return <OtherContent parsed={parsed} title={title} filename={filename} allowDownload={allowDownload} />;
  }
}

// ── AI Image ──────────────────────────────────────────────────────────────────

function AiImageContent({ parsed, filename, allowDownload }: { parsed: Extract<ParsedContent, { type: "ai-image" }>; filename: string; allowDownload: boolean }) {
  return (
    <ContentLayout
      meta={[
        ["Model", parsed.aiModel],
        ["Resolution", parsed.resolution],
        ["Style", parsed.styleTags],
        ["License", parsed.license],
      ]}
      viewer={
        <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-black">
          <img src={parsed.fullImageUrl} alt="Full resolution" className="w-full object-contain max-h-[72vh]" />
        </div>
      }
    />
  );
}

function ResearchContent({ parsed, filename, allowDownload }: { parsed: Extract<ParsedContent, { type: "research" }>; filename: string; allowDownload: boolean }) {
  return (
    <ContentLayout
      meta={[]}
      viewer={<UrlViewer url={parsed.reportUrl} />}
    />
  );
}

// ── URL Viewer ────────────────────────────────────────────────────────────────
// Embeds what it can; shows a styled fallback card for sites that block iframes.

function getEmbedStrategy(url: string): { type: "embed"; src: string } | { type: "fallback" } {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // Google Docs / Sheets / Slides — use /preview
    if (host === "docs.google.com") {
      return { type: "embed", src: url.replace(/\/edit.*$/, "/preview") };
    }
    // Notion public pages
    if (host === "notion.so" || host.endsWith(".notion.so") || host === "notion.site" || host.endsWith(".notion.site")) {
      return { type: "embed", src: url };
    }
    // PDF — proxy via Google Docs viewer
    if (/\.pdf($|\?)/i.test(u.pathname) || /\/pdf\b/i.test(url)) {
      return { type: "embed", src: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` };
    }
    // Sites known to block iframes — show fallback
    if (["medium.com", "substack.com", "twitter.com", "x.com", "github.com"].some((d) => host === d || host.endsWith(`.${d}`))) {
      return { type: "fallback" };
    }
    // Everything else: try iframe
    return { type: "embed", src: url };
  } catch {
    return { type: "fallback" };
  }
}

function UrlViewer({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const strategy = getEmbedStrategy(url);

  let hostname = "";
  try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  if (strategy.type === "embed" && !failed) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white/90 px-4 py-2.5 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faviconUrl} alt="" className="h-4 w-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="flex-1 truncate font-mono text-xs text-[var(--muted)]">{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        </div>
        <iframe
          src={strategy.src}
          className="h-[75vh] w-full"
          title="Content viewer"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            // Detect if page blocked the frame by checking if content loaded
            try {
              const doc = (e.target as HTMLIFrameElement).contentDocument;
              if (doc && doc.title === "") setFailed(true);
            } catch { /* cross-origin — that's fine, it loaded */ }
          }}
        />
      </div>
    );
  }

  // Fallback card for Medium, Substack, etc.
  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/70 p-8 flex flex-col items-center gap-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={faviconUrl} alt={hostname} className="h-8 w-8 rounded" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
      </div>
      <div>
        <p className="font-bold text-[var(--foreground)]">{hostname}</p>
        <p className="mt-1 text-sm text-[var(--muted)] max-w-sm break-all">{url}</p>
      </div>
      <p className="text-xs text-[var(--muted)]">
        This site doesn't allow embedding — click below to read it directly.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button>
          <ExternalLink className="h-4 w-4" />
          Open {hostname}
        </Button>
      </a>
    </div>
  );
}

function PromptContent({
  parsed, title, filename, allowDownload,
}: {
  parsed: Extract<ParsedContent, { type: "prompt" }>;
  title: string;
  filename: string;
  allowDownload: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copyPrompt() { navigator.clipboard.writeText(parsed.promptText); setCopied(true); setTimeout(() => setCopied(false), 1800); }

  return (
    <ContentLayout
      meta={[
        ["Works with", parsed.worksWithModels],
        ["Use case", parsed.useCase],
      ]}
      viewer={
        <div className="relative rounded-[1.4rem] border border-[var(--border)] bg-white/70 p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--foreground)]">
            {parsed.promptText}
          </pre>
          <button
            onClick={copyPrompt}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)] shadow-sm transition-all hover:text-[var(--foreground)]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      }
    />
  );
}

function DatasetContent({ parsed, allowDownload }: { parsed: Extract<ParsedContent, { type: "dataset" }>; allowDownload: boolean }) {
  const isCsv = /\.csv($|\?)/i.test(parsed.downloadUrl) || parsed.dataFormat?.toUpperCase() === "CSV";

  return (
    <ContentLayout
      meta={[
        ["Format", parsed.dataFormat],
        ["Records", parsed.recordCount],
        ["Date range", parsed.dateRange],
        ["Columns", parsed.columnSchema],
      ]}
      viewer={
        isCsv ? (
          <CsvViewer url={parsed.downloadUrl} />
        ) : (
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--success-soft)] p-6 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--success)]">Download ready</p>
            <a href={parsed.downloadUrl} target="_blank" rel="noopener noreferrer"
              className="block break-all text-sm font-mono text-[var(--foreground)] underline underline-offset-2">
              {parsed.downloadUrl}
            </a>
          </div>
        )
      }
    />
  );
}

function OtherContent({
  parsed, title, filename, allowDownload,
}: {
  parsed: Extract<ParsedContent, { type: "other" }>;
  title: string;
  filename: string;
  allowDownload: boolean;
}) {
  return (
    <ContentLayout
      meta={[]}
      viewer={
        <div className="relative rounded-[1.4rem] border border-[var(--border)] bg-white/70 p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--foreground)]">
            {parsed.raw}
          </pre>
        </div>
      }
    />
  );
}

// ── CSV viewer ────────────────────────────────────────────────────────────────

function CsvViewer({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        setRows(parseCSV(text));
        setStatus("ok");
      })
      .catch((e) => {
        setErrorMsg(
          e.message.includes("Failed to fetch") || e.message.includes("NetworkError")
            ? "Cannot preview — CORS policy blocks direct fetch. Download to view locally."
            : e.message,
        );
        setStatus("error");
      });
  }, [url]);

  if (status === "loading") {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-[var(--border)] bg-white/60">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-strong)]" />
        <p className="text-xs text-[var(--muted)]">Loading CSV…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50/60 p-5 space-y-1.5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">Preview unavailable</p>
        <p className="text-sm text-[var(--foreground)]">{errorMsg}</p>
      </div>
    );
  }

  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const preview = dataRows.slice(0, 100);

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-white overflow-hidden shadow-[0_4px_20px_rgba(54,72,42,0.07)]">
      {/* Table header bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5 bg-white/90">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--success-soft)]">
            <Database className="h-3.5 w-3.5 text-[var(--success)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">Data Preview</p>
            <p className="text-[0.68rem] text-[var(--muted)]">
              {dataRows.length.toLocaleString()} rows · {headers.length} columns
              {dataRows.length > 100 && " · showing first 100"}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable table — height fits content up to viewport cap */}
      <div className="overflow-auto" style={{
        height: Math.min(preview.length * 41 + 44, window?.innerHeight ? window.innerHeight - 280 : 600),
        maxHeight: "calc(100vh - 280px)",
      }}>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10">
              {/* Row number header */}
              <th className="sticky left-0 z-20 w-10 border-b border-r border-[var(--border)] bg-gray-50 px-3 py-3 text-center text-[0.6rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                #
              </th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-r border-[var(--border)] bg-gray-50 px-4 py-3 text-left text-[0.68rem] font-black uppercase tracking-[0.1em] text-[var(--foreground)] last:border-r-0 whitespace-nowrap"
                >
                  {h || <span className="text-[var(--muted)]">col_{i + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, ri) => (
              <tr
                key={ri}
                className={`group border-b border-[var(--border)] transition-colors last:border-b-0 ${
                  ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } hover:bg-[var(--success-soft)]/40`}
              >
                {/* Row number */}
                <td className="sticky left-0 border-r border-[var(--border)] bg-inherit px-3 py-2.5 text-center text-[0.65rem] font-mono text-[var(--muted)]">
                  {ri + 1}
                </td>
                {headers.map((_, ci) => {
                  const val = row[ci] ?? "";
                  const isNum = val !== "" && !isNaN(Number(val));
                  return (
                    <td
                      key={ci}
                      title={val}
                      className={`max-w-[220px] truncate border-r border-[var(--border)] py-2.5 pl-4 pr-3 font-mono last:border-r-0 ${
                        isNum
                          ? "text-right text-[var(--accent-strong)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {val || <span className="text-[var(--muted)] opacity-40">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dataRows.length > 100 && (
        <div className="border-t border-[var(--border)] bg-gray-50/60 px-5 py-3 text-center text-xs text-[var(--muted)]">
          Showing 100 of {dataRows.length.toLocaleString()} rows — download for full dataset
        </div>
      )}
    </div>
  );
}

/** Auto-detects delimiter (comma, semicolon, tab) from first line */
function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];

  // Detect delimiter from the header row
  const first = lines[0];
  const delim =
    (first.match(/\t/g) ?? []).length > (first.match(/;/g) ?? []).length &&
    (first.match(/\t/g) ?? []).length > (first.match(/,/g) ?? []).length
      ? "\t"
      : (first.match(/;/g) ?? []).length > (first.match(/,/g) ?? []).length
      ? ";"
      : ",";

  function parseLine(line: string): string[] {
    const row: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === delim && !inQuote) {
        row.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    row.push(cur.trim());
    return row;
  }

  return lines.map(parseLine);
}

