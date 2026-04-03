"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Info,
  Loader2,
  Play,
  Search,
  ShieldCheck,
  Unlock,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CooperMascot } from "@/components/mascot/CooperMascot";
import { useWallet } from "@/lib/use-wallet";
import type { AgentLog, Policy } from "@/types";
import { runBuyerAgent } from "@/lib/agent";

const DEFAULT_POLICY: Policy = {
  dailyLimit: 50,
  maxPerTransaction: 10,
  allowedCategories: [],
  requireApprovalAbove: 5,
};

const logIcons: Record<AgentLog["type"], React.ReactNode> = {
  search: <Search className="h-3.5 w-3.5 text-sky-600" />,
  policy_check: <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />,
  approval_request: <AlertCircle className="h-3.5 w-3.5 text-[var(--accent)]" />,
  payment: <Zap className="h-3.5 w-3.5 text-[var(--accent-strong)]" />,
  unlock: <Unlock className="h-3.5 w-3.5 text-[var(--success)]" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
};

const logColors: Record<AgentLog["type"], string> = {
  search: "border-sky-200 bg-sky-50/80",
  policy_check: "border-lime-200 bg-lime-50/80",
  approval_request: "border-orange-200 bg-orange-50/80",
  payment: "border-orange-200 bg-orange-50/80",
  unlock: "border-emerald-200 bg-emerald-50/80",
  error: "border-red-200 bg-red-50/80",
};

export default function AgentPage() {
  const { session, loading: sessionLoading } = useWallet();
  const [goal, setGoal] = useState("find latest Solana research under $5");
  const [maxPrice, setMaxPrice] = useState("5");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [result, setResult] = useState<{ success: boolean; txHash?: string; content?: string } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  function getPolicy(): Policy {
    try {
      const stored = localStorage.getItem("cooper_policy");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_POLICY;
  }

  async function handleRun() {
    if (!session) return;
    setRunning(true);
    setLogs([]);
    setResult(null);

    const policy = getPolicy();
    const res = await runBuyerAgent(
      { query: goal, maxPrice: Number(maxPrice) },
      policy,
      session.walletAddress,
      (log) => setLogs((prev) => [...prev, log]),
      session.userId,
    );

    setResult({
      success: res.success,
      txHash: res.txHash,
      content: res.listing ? `Unlocked: ${res.listing.title}` : res.error,
    });
    setRunning(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex items-center gap-4">
        <CooperMascot size={72} animated={running} variant={running ? "run" : "idle"} />
        <div>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--foreground)]">Agent Control Panel</h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Cooper finds, evaluates, and purchases content within your policy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[var(--accent-strong)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Agent Goal</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  What should the agent find?
                </label>
                <textarea
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full resize-none rounded-[1.2rem] px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Max budget (USDC)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-[1.2rem] px-4 py-3 text-sm"
                />
              </div>

              <div className="flex items-start gap-2 rounded-[1.35rem] border border-lime-200 bg-lime-100/70 p-4 text-xs text-[var(--foreground)]">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--success)]" />
                <span>
                  Policy rules from your <a href="/dashboard" className="underline">Dashboard</a> are
                  applied automatically. Keys never leave the OWS vault.
                </span>
              </div>

              {!sessionLoading && !session ? (
                <div className="rounded-[1.2rem] border border-red-200 bg-red-50/80 p-3 text-center text-xs text-red-700">
                  Sign in to run the agent — your OWS wallet is required for payments.
                </div>
              ) : (
                <Button className="w-full" onClick={handleRun} loading={running} disabled={!goal || running || !session}>
                  <Play className="h-3.5 w-3.5" />
                  {running ? "Agent Running..." : "Run Agent"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${running ? "bg-[var(--success)] animate-pulse" : logs.length ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"}`}
                />
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
                  {running ? "Agent is thinking..." : logs.length ? "Agent Log" : "Awaiting mission"}
                </h2>
              </div>
              {running && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-strong)]" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-64 max-h-96 space-y-2 overflow-y-auto pr-1">
              {!logs.length && !running && (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--muted)]/70">
                  <Bot className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm text-[var(--muted)]">Set a goal and run the agent</p>
                </div>
              )}

              {logs.map((log) => (
                <div key={log.id} className={`flex items-start gap-2.5 rounded-[1.2rem] border p-3 text-xs ${logColors[log.type]}`}>
                  <span className="mt-0.5 flex-shrink-0">{logIcons[log.type]}</span>
                  <div className="min-w-0">
                    <p className="leading-relaxed text-[var(--foreground)]">{log.message}</p>
                    <p className="mt-0.5 font-mono text-[var(--muted)]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {result && (
                <div
                  className={`flex items-start gap-2.5 rounded-[1.2rem] border p-3 text-xs font-semibold ${
                    result.success
                      ? "border-lime-200 bg-lime-50/80 text-[var(--success)]"
                      : "border-red-200 bg-red-50/80 text-red-700"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{result.content}</span>
                </div>
              )}

              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-lime-200 bg-[linear-gradient(90deg,rgba(232,247,204,0.92),rgba(255,237,214,0.94))]">
        <CardContent className="pt-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--foreground)]">
            How the agent stays safe
          </h3>
          <div className="grid grid-cols-1 gap-4 text-xs text-[var(--muted)] sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--success)]" />
              <span>
                <strong className="text-[var(--foreground)]">MoonPay OWS</strong> enforces policy
                rules before any signing occurs.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-strong)]" />
              <span>
                <strong className="text-[var(--foreground)]">x402 protocol</strong> handles the
                payment flow without the agent holding funds.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Bot className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
              <span>
                <strong className="text-[var(--foreground)]">Policy approval</strong> steps in above
                your configured threshold.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
