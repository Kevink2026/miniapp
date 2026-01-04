'use client';

import { useState } from 'react';
import { type WalletStats } from '@/lib/base';
import { getTierByOrder, calculatePercentile, formatWalletOrder, formatPercentile, formatDate } from '@/lib/tiers';
import { TierBadge } from './TierBadge';
import { getBasescanTxUrl } from '@/lib/base';

interface ResultsDisplayProps {
  stats: WalletStats;
  onReset: () => void;
}

export function ResultsDisplay({ stats, onReset }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const tier = getTierByOrder(stats.walletOrder);
  const percentile = calculatePercentile(stats.walletOrder, stats.totalWallets);

  const shareText = `I'm wallet ${formatWalletOrder(stats.walletOrder)} on Base - earlier than ${formatPercentile(percentile)} of all wallets!

My tier: ${tier.emoji} ${tier.name}

Check how early YOU are`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Main Result */}
      <div className="text-center space-y-2">
        <p className="text-gray-400">You are earlier than</p>
        <p className="text-5xl font-bold text-gradient glow-text">
          {formatPercentile(percentile)}
        </p>
        <p className="text-gray-400">of Base wallets</p>
      </div>

      {/* Wallet Order */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-1">Wallet Order</p>
        <p className="text-2xl font-mono font-bold text-white">
          {formatWalletOrder(stats.walletOrder)}
        </p>
      </div>

      {/* Tier Badge */}
      <TierBadge tier={tier} walletOrder={stats.walletOrder} size="md" />

      {/* First Transaction Info */}
      <div className="bg-base-gray rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">First Transaction</span>
          <span className="text-white">{formatDate(stats.firstTxTimestamp)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Block</span>
          <span className="text-white font-mono">{stats.firstTxBlockNumber.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Tx</span>
          <a
            href={getBasescanTxUrl(stats.firstTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-blue hover:underline font-mono truncate max-w-[180px]"
          >
            {stats.firstTxHash.slice(0, 8)}...{stats.firstTxHash.slice(-6)}
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleCopy}
          className="w-full py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 glow flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span>
              Copied!
            </>
          ) : (
            <>
              <span>📋</span>
              Share Results
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-6 text-gray-400 hover:text-white font-medium transition-colors"
        >
          Check Another Wallet
        </button>
      </div>
    </div>
  );
}
