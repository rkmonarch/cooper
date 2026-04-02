/**
 * Server-side OWS (Open Wallet Standard) helpers.
 * Uses @open-wallet-standard/core — a NAPI-RS native binding.
 * Never imported on the client — API routes only.
 */

import {
  createWallet,
  getWallet,
  signTransaction,
} from "@open-wallet-standard/core";
import type { WalletInfo } from "@open-wallet-standard/core";
import { VersionedTransaction } from "@solana/web3.js";

export function walletName(userId: string): string {
  return `cooper-${userId}`;
}

/** Create or retrieve the OWS wallet for a given userId. */
export function getOrCreateOwsWallet(userId: string): WalletInfo {
  const name = walletName(userId);
  try {
    return getWallet(name);
  } catch {
    return createWallet(name);
  }
}

/** Extract the Solana address from an OWS WalletInfo. */
export function solanaAddress(wallet: WalletInfo): string {
  const account = wallet.accounts.find(
    (a) =>
      a.chainId.toLowerCase().includes("solana") ||
      a.chainId.includes("501") ||
      a.derivationPath.includes("501"),
  );
  if (!account) throw new Error("No Solana account found in OWS wallet");
  return account.address;
}

/**
 * Sign a Solana VersionedTransaction via OWS and return the signed tx bytes.
 *
 * OWS signTransaction takes the full serialized tx (with zero-filled signature
 * slots), signs the message bytes internally, and returns the 64-byte Ed25519
 * signature as hex. We inject it into tx.signatures[0] and return the tx.
 *
 * The caller is responsible for broadcasting — this lets us use skipPreflight
 * and our own RPC, avoiding the BlockhashNotFound preflight simulation issue.
 */
/** Sign using the exact vault ID (wallet name) stored in DB — avoids userId format issues. */
export function owsSignByVaultId(vaultId: string, tx: VersionedTransaction): VersionedTransaction {
  try {
    getWallet(vaultId);
  } catch {
    throw new Error(
      `OWS vault does not have wallet "${vaultId}". ` +
      `This server's vault is missing the key — transactions can only be signed on the server where the wallet was originally created.`
    );
  }

  const txHex = Buffer.from(tx.serialize()).toString("hex");
  const result = signTransaction(vaultId, "solana", txHex);
  const sigBytes = Buffer.from(result.signature, "hex");
  tx.signatures[0] = sigBytes;
  return tx;
}

export function owsSign(userId: string, tx: VersionedTransaction): VersionedTransaction {
  const name = walletName(userId);

  // Ensure wallet exists in vault before signing
  try {
    getWallet(name);
  } catch {
    throw new Error(
      `OWS vault does not have wallet "${name}". ` +
      `This server's vault is missing the key — transactions can only be signed on the server where the wallet was originally created.`
    );
  }

  const txHex = Buffer.from(tx.serialize()).toString("hex");
  const result = signTransaction(name, "solana", txHex);
  const sigBytes = Buffer.from(result.signature, "hex");
  tx.signatures[0] = sigBytes;
  return tx;
}
