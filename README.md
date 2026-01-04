# How Early on Base?

A Base Mini App that shows how early a wallet was on Base, based on the wallet's first transaction.

## Features

- **Auto-detect wallet** - Automatically checks connected wallet in Base App
- **Manual lookup** - Enter any address to check
- **Wallet order** - See your exact position (e.g. #243,881)
- **Percentile** - Earlier than X% of Base wallets
- **Tier system** - Fun meme-based tiers
- **Shareable** - Copy results to share

## Tier System

| Wallet Order | Tier |
|--------------|------|
| #1 – 1,000 | Insider Trader |
| 1,001 – 10,000 | Unemployed Base Bro |
| 10,001 – 100,000 | Serial Butt Sniffer |
| 100,001 – 500,000 | Thinks He's Early |
| 500,001 – 1,000,000 | Part-Time Amazon Delivery Guy |
| > 1,000,000 | Chillhouse Staker |

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Web3**: OnchainKit MiniKit
- **Blockchain**: Base

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- `NEXT_PUBLIC_URL` - Your deployed app URL
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Get from [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
- `NEXT_PUBLIC_BASESCAN_API_KEY` - Get from [BaseScan](https://basescan.org/apis)

### 3. Run development server

```bash
npm run dev
```

### 4. Deploy to Vercel

Deploy to Vercel and update `NEXT_PUBLIC_URL` with your production URL.

### 5. Sign manifest

Use OnchainKit CLI to sign your manifest for the Base App.

## Resources

- [Base Mini Apps Docs](https://docs.base.org/wallet-app/mini-apps)
- [MiniKit Quickstart](https://docs.base.org/builderkits/minikit/quickstart)
- [OnchainKit](https://github.com/coinbase/onchainkit)

## License

MIT
