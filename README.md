# Cooper

**An AI-native content marketplace where agents actually shop.**

Cooper lets creators sell prompts, research papers, datasets, and AI images for USDC. Buyers — human or autonomous — unlock content in a single click using the [x402 payment protocol](https://x402.org) on Solana devnet. An on-page agent can search, evaluate, and purchase within a configurable spending policy, with all signing handled server-side through [MoonPay's Open Wallet Standard (OWS)](https://github.com/open-wallet-standard).

---

## Features

- **Browse & filter** — search by keyword, category, price range, and sort by newest, most sold, or price
- **One-click purchase** — pay in USDC on Solana devnet; content unlocks instantly
- **Creator profiles** — public pages at `/profile/<username>` showing all published listings
- **List content** — publish prompts, research, datasets, or AI images with optional preview image and download toggle
- **Embedded viewer** — Google Docs, Notion, and PDFs render inline; other URLs show a rich fallback card
- **Autonomous agent** — give the agent a goal and a budget cap; it searches, applies your spending policy, and signs + broadcasts the payment without manual input
- **Spending policy** — set per-transaction limit, daily cap, allowed categories, and an approval threshold from your dashboard
- **Devnet wallet dashboard** — view your Solana devnet SOL and USDC balance, copy your wallet address, and set a public username

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Google OAuth) |
| Database | Neon (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Blockchain | Solana devnet |
| Payments | USDC via x402 protocol |
| Wallet signing | MoonPay Open Wallet Standard (OWS) |
| Image uploads | Cloudinary |
| Signer server | Express (deployed separately on Render) |
| Package manager | Bun |

---

## Project Structure

```
cooper/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── listings/page.tsx         # Browse marketplace
│   ├── content/[listingId]/      # Unlocked content viewer
│   ├── create/page.tsx           # Publish new listing
│   ├── agent/page.tsx            # Autonomous buyer agent
│   ├── dashboard/page.tsx        # Wallet + spending policy
│   ├── profile/[username]/       # Creator public profile
│   └── api/
│       ├── listings/             # CRUD for listings
│       ├── pay/                  # Payment + signing endpoint
│       ├── wallet/               # Wallet creation + balance
│       ├── purchases/            # Purchase history
│       ├── content/[listingId]/  # Locked content retrieval
│       └── profile/[username]/   # Creator profile API
├── components/
│   ├── marketplace/              # FeedCard, UnlockModal, ListingsSection
│   ├── wallet/                   # WalletButton
│   ├── mascot/                   # CooperMascot animation
│   └── ui/                       # Button, Card, Badge primitives
├── lib/
│   ├── agent.ts                  # Buyer agent logic
│   ├── signer-client.ts          # HTTP client for the OWS signer server
│   ├── solana-payment.ts         # Solana USDC transaction builder
│   ├── use-wallet.ts             # useWallet() React hook
│   ├── use-purchases.ts          # Purchased listing IDs hook
│   └── db/
│       ├── index.ts              # Drizzle + Neon connection
│       └── schema.ts             # users, listings, payments tables
├── signer/                       # Standalone Express signer server
│   └── src/index.ts
├── public/
│   └── AGENTS.md                 # Machine-readable API walkthrough for LLM agents
└── types/index.ts
```

---

## How Payments Work

1. Buyer clicks **Unlock** on a listing
2. Browser calls `POST /api/pay` with `{ listingId, userId, walletAddress }`
3. Server fetches the user's OWS vault ID from the database
4. A USDC transfer transaction is built for Solana devnet
5. The transaction is sent to the signer server (`signer/`), which uses the OWS native binding to sign it — private keys never leave the signer
6. The signed transaction is broadcast to Solana devnet and confirmed
7. The purchase is recorded in the database and the full content is returned

---

## How the Agent Works

The agent (`lib/agent.ts`) runs entirely server-side:

1. **Search** — calls `GET /api/listings` with the user's goal query and max budget
2. **Policy check** — validates the top result against the user's spending policy (per-tx limit, allowed categories)
3. **Payment** — calls `POST /api/pay` with the listing ID and wallet session; the server signs + broadcasts
4. **Unlock** — returns the decrypted content to the UI

The agent respects the same policy object stored in the user's dashboard. No private keys are ever passed to the agent.

---

## The OWS Signer Server

The `signer/` directory contains a separate Express server that wraps `@open-wallet-standard/core` (a NAPI-RS native binding). It exposes two authenticated endpoints:

- `POST /wallet` — create or restore an OWS vault, returns the Solana wallet address
- `POST /sign` — sign a serialized Solana transaction, returns the signature

All requests require a `Authorization: Bearer <SIGNING_SECRET>` header. The signer is deployed independently on Render and communicates with the Next.js app via `SIGNER_URL` + `SIGNING_SECRET` environment variables.

---

## Environment Variables

### Next.js app (`.env.local`)

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# OWS Signer
SIGNER_URL=https://your-signer.onrender.com
SIGNING_SECRET=...

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Signer server (`signer/.env`)

```env
PORT=3001
SIGNING_SECRET=...   # must match SIGNING_SECRET in the Next.js app
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A Neon PostgreSQL database
- Google OAuth credentials
- Cloudinary account
- The signer server running (locally or on Render)

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in all values.

### 3. Run database migrations

```bash
bunx drizzle-kit push
```

### 4. Start the signer server

```bash
cd signer
bun install
bun run dev
```

### 5. Start the Next.js app

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying

### Next.js app

Deploy to [Vercel](https://vercel.com). Set all environment variables from the table above in the Vercel project settings. The app uses `force-dynamic` on payment routes so no caching occurs.

### Signer server

Deploy `signer/` as a separate Web Service on [Render](https://render.com):

- **Build command:** `bun install && bun run build`
- **Start command:** `bun run start`
- **Environment variables:** `PORT`, `SIGNING_SECRET`

---

## API Reference

See [`public/AGENTS.md`](public/AGENTS.md) for a complete, machine-readable API reference intended for LLM agents and developers. It covers all endpoints with request/response shapes, filter parameters, the full agent flow, and the spending policy schema.

---

## Database Schema

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `wallet_address` | text | Solana devnet address (from OWS) |
| `email` | text | Google OAuth email |
| `username` | text | Public profile handle |
| `display_name` | text | Display name |
| `ows_vault_id` | text | OWS vault identifier |
| `spending_policy` | JSONB | Per-user policy rules |
| `total_spent` | numeric | Lifetime USDC spent |

### `listings`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | text | Listing title |
| `description` | text | Public description |
| `price` | numeric | Price in USDC |
| `category` | text | `prompt` · `research` · `ai-image` · `dataset` · `other` |
| `preview_url` | text | Public preview image URL |
| `content` | text | Full content (revealed after payment) |
| `content_hash` | text | SHA-256 of content |
| `creator_address` | text | Creator's wallet address |
| `sales_count` | integer | Number of times purchased |
| `allow_download` | boolean | Whether buyer can download |

### `payments`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `listing_id` | UUID | FK → listings |
| `buyer_address` | text | Buyer's wallet address |
| `tx_hash` | text | Solana transaction signature |
| `amount_usdc` | numeric | Amount paid |
| `is_agent` | boolean | Whether purchased by autonomous agent |
| `policy_snapshot` | JSONB | Spending policy at time of purchase |
| `status` | text | `confirmed` · `failed` · `refunded` |

---

## License

MIT
