/**
 * Client for the cooper-signer server (runs on Render/Railway).
 * All OWS signing is delegated to this server so the Next.js app stays stateless.
 */

import { VersionedTransaction } from "@solana/web3.js";

const SIGNER_URL = process.env.SIGNER_URL?.replace(/\/$/, "");
const SIGNING_SECRET = process.env.SIGNING_SECRET;

async function signerFetch(path: string, body: object) {
  if (!SIGNER_URL) throw new Error("SIGNER_URL env var is not set");
  if (!SIGNING_SECRET) throw new Error("SIGNING_SECRET env var is not set");

  const res = await fetch(`${SIGNER_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SIGNING_SECRET}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Signer server error (${res.status}): ${text}`);
  }
  if (!res.ok) throw new Error(data.error ?? `Signer ${path} failed`);
  return data;
}

/**
 * Create or restore the OWS wallet on the signer server.
 * Passing the stored mnemonic ensures the same key is restored after a restart.
 * Returns { address, mnemonic } — persist the mnemonic if this is a new wallet.
 */
export async function remoteGetOrCreateWallet(
  vaultId: string,
  mnemonic?: string | null,
): Promise<{ address: string; mnemonic: string }> {
  const data = await signerFetch("/wallet", { vaultId, mnemonic: mnemonic ?? undefined });
  return { address: data.address as string, mnemonic: data.mnemonic as string };
}

/**
 * Sign a VersionedTransaction via the remote signer.
 * Pass the stored mnemonic so the signer can self-heal after a vault wipe.
 */
export async function remoteSign(
  vaultId: string,
  tx: VersionedTransaction,
  mnemonic?: string | null,
): Promise<VersionedTransaction> {
  const txHex = Buffer.from(tx.serialize()).toString("hex");
  const data = await signerFetch("/sign", { vaultId, txHex, mnemonic: mnemonic ?? undefined });
  const sigBytes = Buffer.from(data.signature as string, "hex");
  tx.signatures[0] = sigBytes;
  return tx;
}
