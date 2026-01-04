'use client';

import { type Tier } from '@/lib/tiers';

interface TierBadgeProps {
  tier: Tier;
  walletOrder: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, walletOrder, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg',
  };

  const emojiSizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${sizeClasses[size]} tier-badge`}
      style={{
        background: `linear-gradient(135deg, ${tier.color}20 0%, ${tier.color}10 100%)`,
        border: `2px solid ${tier.color}40`,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${tier.color} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 text-center space-y-3">
        <div className={emojiSizes[size]}>{tier.emoji}</div>
        <h3
          className="font-bold"
          style={{ color: tier.color }}
        >
          {tier.name}
        </h3>
        <p className="text-gray-400 text-sm">{tier.description}</p>
      </div>
    </div>
  );
}
