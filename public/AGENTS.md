# Cooper Agent Walkthrough

Cooper is an AI-native content marketplace on Solana devnet. Payments are made in USDC via the x402 protocol, signed through an Open Wallet Standard (OWS) vault. This document lets any LLM agent autonomously browse, evaluate, and purchase content without touching the UI.

Base URL: `https://cooper.vercel.app` (or `http://localhost:3000` locally)

---

## Authentication

Cooper uses Next-Auth (Google OAuth). Agents acting on behalf of a user need:

- `userId` — the internal DB user ID (string UUID)
- `walletAddress` — the user's Solana devnet wallet address (base58)

These are embedded in the JWT session. From the browser, fetch `/api/auth/session`:

```bash
curl https://cooper.vercel.app/api/auth/session \
  -H "Cookie: next-auth.session-token=<token>"
# Returns: { user: { id, walletAddress, name, username, email, image } }
```

From a server context, use the `userId` + `walletAddress` values your orchestrator obtained after the user authenticated.

---

## 1. Browse Listings

```
GET /api/listings
```

Query parameters (all optional):

| Param           | Type   | Description                                          |
|----------------|--------|------------------------------------------------------|
| `q`            | string | Title search (case-insensitive, partial match)       |
| `category`     | string | `prompt` · `research` · `ai-image` · `dataset` · `other` |
| `sort`         | string | `newest` · `most_bought` · `least_bought` · `price_asc` · `price_desc` |
| `minPrice`     | number | Minimum price in USDC                                |
| `maxPrice`     | number | Maximum price in USDC                                |
| `creatorAddress` | string | Filter by creator wallet address                  |

Response:

```json
{
  "listings": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "price": "1.50",
      "category": "research",
      "previewUrl": "https://...",
      "creatorAddress": "base58",
      "creatorName": "string",
      "creatorUsername": "string",
      "contentHash": "sha256hex",
      "allowDownload": true,
      "salesCount": 42,
      "createdAt": "ISO8601"
    }
  ]
}
```

Example — find research under $5, sorted by popularity:

```bash
curl "https://cooper.vercel.app/api/listings?category=research&maxPrice=5&sort=most_bought"
```

---

## 2. Check If Already Purchased

Before paying, check whether the user already owns a listing:

```
GET /api/purchases?userId=<userId>
```

Response:

```json
{ "purchasedIds": ["uuid1", "uuid2"] }
```

If `listingId` is in `purchasedIds`, skip payment and go straight to step 4.

---

## 3. Purchase a Listing

```
POST /api/pay
Content-Type: application/json

{
  "listingId": "uuid",
  "userId": "userId",
  "walletAddress": "base58",
  "isAgent": true,
  "policySnapshot": {
    "dailyLimit": 50,
    "maxPerTransaction": 10,
    "allowedCategories": [],
    "requireApprovalAbove": 5
  }
}
```

The server will:
1. Look up the user's OWS vault by `walletAddress`
2. Restore the vault if needed (idempotent — uses stored mnemonic)
3. Build a Solana USDC transfer transaction on devnet
4. Sign via the OWS signer
5. Broadcast and confirm on devnet

Success response (`200`):

```json
{
  "txHash": "base58-signature",
  "content": "The full unlocked content text or URL"
}
```

Error response:

```json
{ "error": "reason string" }
```

Common errors:
- `"Missing listingId or userId"` — required fields absent
- `"Missing wallet address"` — user has no OWS wallet yet; they must sign in via the UI first
- `"Policy: exceeds per-transaction limit"` — price > `maxPerTransaction`
- `"Policy: category not allowed"` — category not in `allowedCategories` (empty = all allowed)
- `"Already purchased"` — listing already owned
- `"Insufficient USDC balance"` — top up devnet USDC via a faucet

---

## 4. Access Unlocked Content

After purchase, retrieve the full content:

```
GET /api/content/<listingId>?userId=<userId>
```

Response:

```json
{
  "content": "full text or URL",
  "listing": { ...listing object... }
}
```

---

## 5. List a Creator Profile

```
GET /api/profile/<username>
```

Returns creator info + their published listings.

---

## 6. Publish a Listing (as a creator)

```
POST /api/listings
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "price": "2.00",
  "category": "prompt",
  "content": "the full content to lock",
  "creatorAddress": "base58",
  "creatorName": "display name",
  "previewUrl": "https://...",
  "allowDownload": true
}
```

---

## End-to-End Agent Flow

```
1. GET /api/listings?q=<goal>&maxPrice=<budget>&sort=most_bought
   → pick listings[0]

2. GET /api/purchases?userId=<userId>
   → if listingId in purchasedIds, skip to step 4

3. POST /api/pay { listingId, userId, walletAddress, isAgent: true, policySnapshot }
   → { txHash, content }

4. Use content — display, summarize, or pass downstream
```

---

## Policy Object

Policy constraints are enforced server-side when `policySnapshot` is provided:

```json
{
  "dailyLimit": 50,
  "maxPerTransaction": 10,
  "allowedCategories": [],
  "requireApprovalAbove": 5
}
```

- `allowedCategories: []` means **all categories are allowed**
- `requireApprovalAbove` is advisory — the agent auto-approves at or below `maxPerTransaction`
- Set `maxPerTransaction` low (e.g. `1`) for read-only budget-constrained agents

---

## Notes for LLM Agents

- All prices are in **USDC** (not SOL). The devnet USDC mint is `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- Payments settle on **Solana devnet** — no real money involved
- `isAgent: true` in the pay body is a signal flag; the server flow is identical
- You do not need to build or sign transactions — `/api/pay` handles everything server-side
- To get devnet USDC for testing, use the [Solana devnet faucet](https://faucet.solana.com) for SOL, then swap via a devnet DEX
