export interface Tier {
  name: string;
  minOrder: number;
  maxOrder: number;
  color: string;
  emoji: string;
  description: string;
}

export const TIERS: Tier[] = [
  {
    name: 'Insider Trader',
    minOrder: 1,
    maxOrder: 1000,
    color: '#FFD700',
    emoji: '👑',
    description: 'The absolute earliest. Legend status.',
  },
  {
    name: 'Unemployed Base Bro',
    minOrder: 1001,
    maxOrder: 10000,
    color: '#C0C0C0',
    emoji: '🏠',
    description: 'So early you probably had inside info.',
  },
  {
    name: 'Serial Butt Sniffer',
    minOrder: 10001,
    maxOrder: 100000,
    color: '#CD7F32',
    emoji: '👃',
    description: 'You smelled the opportunity before most.',
  },
  {
    name: 'Thinks He\'s Early',
    minOrder: 100001,
    maxOrder: 500000,
    color: '#4A90D9',
    emoji: '🤔',
    description: 'Earlier than you think, but not that early.',
  },
  {
    name: 'Part-Time Amazon Delivery Guy',
    minOrder: 500001,
    maxOrder: 1000000,
    color: '#6B7280',
    emoji: '📦',
    description: 'Still grinding, still showing up.',
  },
  {
    name: 'Chillhouse Staker',
    minOrder: 1000001,
    maxOrder: Infinity,
    color: '#9CA3AF',
    emoji: '🧘',
    description: 'Fashionably late, but vibing.',
  },
];

export function getTierByOrder(walletOrder: number): Tier {
  for (const tier of TIERS) {
    if (walletOrder >= tier.minOrder && walletOrder <= tier.maxOrder) {
      return tier;
    }
  }
  return TIERS[TIERS.length - 1];
}

export function calculatePercentile(walletOrder: number, totalWallets: number): number {
  if (totalWallets === 0) return 0;
  const percentile = ((totalWallets - walletOrder) / totalWallets) * 100;
  return Math.max(0, Math.min(100, percentile));
}

export function formatWalletOrder(order: number): string {
  return `#${order.toLocaleString()}`;
}

export function formatPercentile(percentile: number): string {
  return `${percentile.toFixed(1)}%`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
