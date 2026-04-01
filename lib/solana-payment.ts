/**
 * Client-side USDC transfer builder for Solana devnet.
 * Uses @solana/web3.js v1 + @solana/spl-token.
 * The resulting Transaction is passed to Phantom's signAndSendTransaction.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Devnet USDC mint (Circle testnet)
export const USDC_DEVNET_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
export const USDC_DECIMALS = 6;

export const DEVNET_CONNECTION = new Connection(
  clusterApiUrl("devnet"),
  "confirmed"
);

/**
 * Builds a USDC transferChecked transaction on devnet.
 * The transaction must be signed and sent by the caller via Phantom.
 *
 * @param fromPubkey   Buyer's Solana public key (base58)
 * @param toPubkey     Recipient's Solana public key (base58)
 * @param amountUsdc   Amount in USDC (e.g. 2.5)
 */
export async function buildUsdcTransferTx(
  fromPubkey: string,
  toPubkey: string,
  amountUsdc: number,
): Promise<Transaction> {
  const from = new PublicKey(fromPubkey);
  const to = new PublicKey(toPubkey);

  const fromAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, from);
  const toAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, to);

  const amountRaw = BigInt(Math.round(amountUsdc * 10 ** USDC_DECIMALS));

  const { blockhash, lastValidBlockHeight } =
    await DEVNET_CONNECTION.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    feePayer: from,
    blockhash,
    lastValidBlockHeight,
  });

  tx.add(
    createTransferCheckedInstruction(
      fromAta,
      USDC_DEVNET_MINT,
      toAta,
      from,
      amountRaw,
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  return tx;
}

/**
 * Checks that the recipient's ATA exists on devnet.
 * Returns true if the account exists, false otherwise.
 * The recipient must have previously received USDC (or created their ATA) for
 * the transfer to succeed.
 */
export async function recipientAtaExists(recipientPubkey: string): Promise<boolean> {
  try {
    const to = new PublicKey(recipientPubkey);
    const toAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, to);
    const info = await DEVNET_CONNECTION.getAccountInfo(toAta);
    return info !== null;
  } catch {
    return false;
  }
}
