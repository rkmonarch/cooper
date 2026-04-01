/**
 * Client-side USDC transfer builder for Solana devnet.
 * Uses @solana/web3.js v1 + @solana/spl-token.
 *
 * Follows the BetForm pattern:
 *  - Idempotent ATA creation (always included, never fails if ATA already exists)
 *  - VersionedTransaction (v0) via TransactionMessage.compileToV0Message()
 *  - Caller signs + broadcasts via solana.signAndSendTransaction() directly
 */

import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
 * Builds a USDC transferChecked transaction on devnet as a VersionedTransaction (v0).
 * Uses idempotent ATA instructions — always included, never fails if ATAs already exist.
 *
 * @param fromPubkey   Buyer's Solana public key (base58)
 * @param toPubkey     Recipient's Solana public key (base58)
 * @param amountUsdc   Amount in USDC (e.g. 2.5)
 */
export async function buildUsdcTransferTx(
  fromPubkey: string,
  toPubkey: string,
  amountUsdc: number,
): Promise<VersionedTransaction> {
  const from = new PublicKey(fromPubkey);
  const to = new PublicKey(toPubkey);

  const fromAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, from);
  const toAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, to);

  const amountRaw = BigInt(Math.round(amountUsdc * 10 ** USDC_DECIMALS));

  const { blockhash } = await DEVNET_CONNECTION.getLatestBlockhash("confirmed");

  const instructions = [
    // Idempotent: creates buyer's ATA if missing, no-ops if it already exists
    createAssociatedTokenAccountIdempotentInstruction(
      from,
      fromAta,
      from,
      USDC_DEVNET_MINT,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    // Idempotent: creates recipient's ATA if missing, buyer pays rent
    createAssociatedTokenAccountIdempotentInstruction(
      from,
      toAta,
      to,
      USDC_DEVNET_MINT,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
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
  ];

  const message = new TransactionMessage({
    payerKey: from,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

/**
 * Pre-flight check: verifies buyer has enough USDC and SOL before building the tx.
 * Factors in recipient ATA rent (~0.002 SOL) if it doesn't exist yet.
 */
export async function preflightCheck(
  buyerPubkey: string,
  recipientPubkey: string,
  requiredUsdc: number,
): Promise<{ usdcBalance: number; solBalance: number }> {
  const from = new PublicKey(buyerPubkey);
  const to   = new PublicKey(recipientPubkey);
  const fromAta = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, from);
  const toAta   = getAssociatedTokenAddressSync(USDC_DEVNET_MINT, to);

  const [fromAtaInfo, toAtaInfo, solLamports] = await Promise.all([
    DEVNET_CONNECTION.getAccountInfo(fromAta),
    DEVNET_CONNECTION.getAccountInfo(toAta),
    DEVNET_CONNECTION.getBalance(from),
  ]);

  const solBalance = solLamports / 1e9;

  // Buyer has no USDC ATA at all
  if (!fromAtaInfo) {
    throw new Error(
      `No devnet USDC account found. Get USDC at faucet.circle.com (Solana devnet). You also need ~0.01 SOL for fees. Current SOL: ${solBalance.toFixed(4)}`,
    );
  }

  // Parse token balance (u64 LE at byte offset 64 in the token account data)
  const rawAmount = fromAtaInfo.data.readBigUInt64LE(64);
  const usdcBalance = Number(rawAmount) / 10 ** USDC_DECIMALS;

  if (usdcBalance < requiredUsdc) {
    throw new Error(
      `Insufficient devnet USDC. You have ${usdcBalance.toFixed(2)} USDC but need ${requiredUsdc} USDC. Get more at faucet.circle.com (Solana devnet).`,
    );
  }

  // Minimum SOL needed:
  //   ~0.000005 SOL  base tx fee
  //   ~0.00204 SOL   rent for recipient's ATA if it doesn't exist yet
  const needsRecipientAta = !toAtaInfo;
  const minSol = 0.001 + (needsRecipientAta ? 0.00204 : 0);

  if (solBalance < minSol) {
    const reason = needsRecipientAta
      ? `The recipient's USDC account doesn't exist yet and needs to be created (one-time rent ~0.002 SOL). `
      : "";
    throw new Error(
      `${reason}You need at least ${minSol.toFixed(4)} SOL but only have ${solBalance.toFixed(4)} SOL. ` +
      `Run: solana airdrop 1 ${buyerPubkey} --url devnet`,
    );
  }

  return { usdcBalance, solBalance };
}
