import { db } from "../lib/db";
import { listings } from "../lib/db/schema";

const DEMO_LISTINGS = [
  {
    title: "Solana DeFi Ecosystem Report Q1 2025",
    description:
      "In-depth analysis of Solana's DeFi landscape: TVL trends, top protocols, yield opportunities, and risk assessment. 18-page PDF equivalent.",
    price: "4.99",
    category: "research",
    creatorName: "ResearchDAO",
    creatorAddress: "SoLR3s3arcH0000000000000000000000000000000",
    contentHash: "a1b2c3d4e5f6",
    content:
      "# Solana DeFi Report Q1 2025\n\n## Executive Summary\nSolana DeFi TVL reached $8.2B in Q1 2025, up 340% YoY...\n\n## Top Protocols\n1. Jupiter (DEX aggregator) — $2.1B TVL\n2. Kamino Finance — $1.4B TVL\n3. MarginFi — $890M TVL\n\n## Key Trends\n- Liquid staking dominance continues\n- New perps protocols gaining traction\n- Cross-chain bridges maturing\n\n## Risk Assessment\nMedium risk profile given validator concentration and network outage history...",
  },
  {
    title: "GPT-4o System Prompt Collection Vol. 3",
    description:
      "50 battle-tested system prompts for coding, writing, analysis, and creative tasks. All prompts tested across GPT-4o, Claude, and Gemini.",
    price: "2.50",
    category: "prompt",
    creatorName: "PromptLabs",
    creatorAddress: "Pr0mPtLaBS0000000000000000000000000000000",
    contentHash: "b2c3d4e5f6a1",
    content:
      "# Premium Prompt Collection Vol. 3\n\n## 1. Expert Code Reviewer\nYou are a senior software engineer with 15 years of experience...\n\n## 2. Research Synthesizer\nYou are an academic researcher specializing in...\n\n## 3. Startup Advisor\nYou are a YC partner who has reviewed 1000+ pitches...\n\n[...47 more prompts included]",
  },
  {
    title: "AI-Generated Solana Landscape Art Pack",
    description:
      "20 high-resolution AI-generated artworks themed around Solana's ecosystem — validators, NFTs, DeFi. Commercial license included.",
    price: "9.99",
    category: "ai-image",
    creatorName: "ArtEngine",
    creatorAddress: "ArtEngInE00000000000000000000000000000000",
    contentHash: "c3d4e5f6a1b2",
    content:
      "# Art Pack Download Links\n\nYour 20-image collection is ready:\n\n1. validator_node_cyberpunk.png (4096x4096)\n2. defi_vortex_blue.png (4096x4096)\n3. solana_ghost_neon.png (4096x4096)\n...\n\nCommercial License: You may use these images in commercial projects without attribution.",
  },
  {
    title: "Base Chain Transaction Dataset (Jan-Mar 2025)",
    description:
      "50,000 anonymized transactions from Base mainnet. Includes gas, contract addresses, timestamps, and categorical labels for ML training.",
    price: "14.99",
    category: "dataset",
    creatorName: "ChainData.io",
    creatorAddress: "ChAInDaTa0000000000000000000000000000000",
    contentHash: "d4e5f6a1b2c3",
    content:
      "# Base Chain Dataset Q1 2025\n\n## Download\nCSV file (127MB): https://chaindata.io/download/base-q1-2025-XXXXX\n\n## Schema\n- tx_hash (string)\n- block_number (int)\n- timestamp (unix)\n- from_address (string)\n- to_address (string)\n- value_eth (float)\n- gas_used (int)\n- category (enum: defi/nft/bridge/other)\n\n## Usage Notes\nAll addresses are pseudonymized using SHA-256. No PII included.",
  },
  {
    title: "Claude API Integration Cheat Sheet",
    description:
      "Quick-reference guide for building production Claude API integrations: streaming, tool use, vision, caching, and cost optimization tips.",
    price: "1.99",
    category: "prompt",
    creatorName: "DevSheets",
    creatorAddress: "D3vSh33tS0000000000000000000000000000000",
    contentHash: "e5f6a1b2c3d4",
    content:
      "# Claude API Cheat Sheet\n\n## Quick Start\n```python\nimport anthropic\nclient = anthropic.Anthropic(api_key='...')\nmessage = client.messages.create(\n    model='claude-opus-4-6',\n    max_tokens=1024,\n    messages=[{'role': 'user', 'content': 'Hello!'}]\n)\n```\n\n## Streaming\n```python\nwith client.messages.stream(...) as stream:\n    for text in stream.text_stream:\n        print(text, end='', flush=True)\n```\n\n## Cost Optimization\n- Use prompt caching for repeated context (90% savings)\n- claude-haiku-4-5 for simple classification tasks\n- Batch API for async workloads (50% discount)",
  },
  {
    title: "Web3 Startup Pitch Deck Template 2025",
    description:
      "10-slide Figma template used by 3 funded Web3 startups. Includes investor Q&A prep guide and token economics framework.",
    price: "7.49",
    category: "other",
    creatorName: "PitchKit",
    creatorAddress: "PiTcHkIt000000000000000000000000000000000",
    contentHash: "f6a1b2c3d4e5",
    content:
      "# Web3 Pitch Deck Template\n\n## Figma File\nLink: figma.com/file/XXXXX (view access granted upon purchase)\n\n## Slide Structure\n1. Problem\n2. Solution\n3. Market Size (TAM/SAM/SOM)\n4. Product Demo\n5. Token Economics\n6. Traction\n7. Team\n8. Roadmap\n9. Financials\n10. Ask\n\n## Token Economics Framework\nIncluded: vesting schedule templates, supply/demand modeling, utility token vs governance token decision tree",
  },
];

async function seed() {
  console.log("Seeding listings...");

  // Clear existing
  await db.delete(listings);

  for (const listing of DEMO_LISTINGS) {
    const [row] = await db.insert(listings).values(listing).returning({ id: listings.id });
    console.log(`✓ ${listing.title} (${row.id})`);
  }

  console.log(`\nDone! Seeded ${DEMO_LISTINGS.length} listings.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
