# How Early on Base? 🔵

A mini app that shows how early a wallet was on Base, based on the wallet's first transaction. Users can mint a soulbound NFT badge proving their OG status.

## Features

- **Wallet Check**: Connect wallet or enter any address to check
- **Early Score**: See your wallet order and percentile ranking
- **Tier System**: Fun meme-based tiers from "Insider Trader" to "Chillhouse Staker"
- **NFT Badge**: Mint a soulbound (non-transferable) NFT as proof
- **Shareable**: Copy results to share on social media

## Tier System

| Wallet Order | Tier |
|--------------|------|
| #1 – 1,000 | 👑 Insider Trader |
| 1,001 – 10,000 | 🏠 Unemployed Base Bro |
| 10,001 – 100,000 | 👃 Serial Butt Sniffer |
| 100,001 – 500,000 | 🤔 Thinks He's Early |
| 500,001 – 1,000,000 | 📦 Part-Time Amazon Delivery Guy |
| > 1,000,000 | 🧘 Chillhouse Staker |

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **Blockchain**: Base (Coinbase L2)
- **Smart Contract**: Solidity (ERC-721 Soulbound)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- `NEXT_PUBLIC_BASESCAN_API_KEY` - Get from [BaseScan](https://basescan.org/apis)

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Smart Contract Deployment

The NFT contract is in `contracts/BaseEarlyBadge.sol`. To deploy:

1. Install Foundry or Hardhat
2. Deploy to Base mainnet
3. Update `BADGE_NFT_ADDRESS` in `src/lib/nft.ts`

## License

MIT
