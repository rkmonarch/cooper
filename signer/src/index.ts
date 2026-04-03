import express, { Request, Response, NextFunction } from "express";
import {
  createWallet,
  getWallet,
  importWalletMnemonic,
  exportWallet,
  signTransaction,
} from "@open-wallet-standard/core";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3001;
const SIGNING_SECRET = process.env.SIGNING_SECRET;

if (!SIGNING_SECRET) {
  console.error("FATAL: SIGNING_SECRET env var is not set");
  process.exit(1);
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireSecret(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (auth !== `Bearer ${SIGNING_SECRET}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function solanaAddress(wallet: ReturnType<typeof getWallet>): string {
  const account = wallet.accounts.find(
    (a) =>
      a.chainId.toLowerCase().includes("solana") ||
      a.chainId.includes("501") ||
      a.derivationPath?.includes("501")
  );
  if (!account) throw new Error("No Solana account found in OWS wallet");
  return account.address;
}

/**
 * Ensure wallet is loaded in vault.
 * Priority: existing vault entry → import from mnemonic → create fresh.
 */
function ensureWallet(vaultId: string, mnemonic?: string): ReturnType<typeof getWallet> {
  try {
    return getWallet(vaultId);
  } catch {
    if (mnemonic) {
      return importWalletMnemonic(vaultId, mnemonic);
    }
    return createWallet(vaultId);
  }
}

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ── POST /wallet ───────────────────────────────────────────────────────────────
// Creates or restores OWS wallet. Returns Solana address + mnemonic so the
// caller can persist it and pass it back on future sign requests.
// Body: { vaultId: string, mnemonic?: string }
app.post("/wallet", requireSecret, (req: Request, res: Response) => {
  const { vaultId, mnemonic } = req.body as { vaultId?: string; mnemonic?: string };

  if (!vaultId) {
    res.status(400).json({ error: "Missing vaultId" });
    return;
  }

  try {
    const wallet = ensureWallet(vaultId, mnemonic);
    const address = solanaAddress(wallet);
    const exported = exportWallet(vaultId);
    res.json({ address, mnemonic: exported });
  } catch (err: any) {
    console.error("[wallet]", err);
    res.status(500).json({ error: err.message ?? "Failed to create wallet" });
  }
});

// ── POST /sign ─────────────────────────────────────────────────────────────────
// Signs a serialized Solana transaction.
// If the vault was wiped (server restart), mnemonic is used to restore the
// exact same key before signing — no more "vault not found" after restarts.
// Body: { vaultId: string, txHex: string, mnemonic?: string }
app.post("/sign", requireSecret, (req: Request, res: Response) => {
  const { vaultId, txHex, mnemonic } = req.body as {
    vaultId?: string;
    txHex?: string;
    mnemonic?: string;
  };

  if (!vaultId || !txHex) {
    res.status(400).json({ error: "Missing vaultId or txHex" });
    return;
  }

  try {
    ensureWallet(vaultId, mnemonic);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to load vault "${vaultId}": ${err.message}` });
    return;
  }

  try {
    const result = signTransaction(vaultId, "solana", txHex);
    res.json({ signature: result.signature });
  } catch (err: any) {
    console.error("[sign]", err);
    res.status(500).json({ error: err.message ?? "Signing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`cooper-signer listening on :${PORT}`);
});
