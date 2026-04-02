import express, { Request, Response, NextFunction } from "express";
import {
  createWallet,
  getWallet,
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
function getOrCreate(vaultId: string) {
  try {
    return getWallet(vaultId);
  } catch {
    return createWallet(vaultId);
  }
}

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

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ── POST /wallet ───────────────────────────────────────────────────────────────
// Creates or retrieves OWS wallet, returns Solana address.
// Body: { vaultId: string }
app.post("/wallet", requireSecret, (req: Request, res: Response) => {
  const { vaultId } = req.body as { vaultId?: string };

  if (!vaultId) {
    res.status(400).json({ error: "Missing vaultId" });
    return;
  }

  try {
    const wallet = getOrCreate(vaultId);
    const address = solanaAddress(wallet);
    res.json({ address });
  } catch (err: any) {
    console.error("[wallet]", err);
    res.status(500).json({ error: err.message ?? "Failed to create wallet" });
  }
});

// ── POST /sign ─────────────────────────────────────────────────────────────────
// Signs a serialized Solana transaction, returns the 64-byte Ed25519 signature.
// Body: { vaultId: string, txHex: string }
app.post("/sign", requireSecret, (req: Request, res: Response) => {
  const { vaultId, txHex } = req.body as { vaultId?: string; txHex?: string };

  if (!vaultId || !txHex) {
    res.status(400).json({ error: "Missing vaultId or txHex" });
    return;
  }

  try {
    // Wallet must already exist — we never create on sign
    getWallet(vaultId);
  } catch {
    res.status(404).json({
      error: `Vault "${vaultId}" not found. Call POST /wallet first to initialise it.`,
    });
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
