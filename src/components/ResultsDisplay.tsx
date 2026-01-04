'use client';

import { useState } from 'react';
import { type WalletStats } from '@/lib/base';
import { getTierByOrder, calculatePercentile, formatWalletOrder, formatPercentile, formatDate } from '@/lib/tiers';
import { TierBadge } from './TierBadge';
import { getBasescanTxUrl } from '@/lib/base';

interface ResultsDisplayProps {
  stats: WalletStats;
  onMint: () => void;
  onReset: () => void;
  isMinting: boolean;
}

export function ResultsDisplay({ stats, onMint, onReset, isMinting }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const tier = getTierByOrder(stats.walletOrder);
  const percentile = calculatePercentile(stats.walletOrder, stats.totalWallets);

  const shareText = `I'm wallet ${formatWalletOrder(stats.walletOrder)} on Base - earlier than ${formatPercentile(percentile)} of all wallets!

My tier: ${tier.emoji} ${tier.name}

Check how early YOU are 👇`;

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
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Main Result */}
      <div className="text-center space-y-2">
        <p className="text-gray-400 text-lg">You are earlier than</p>
        <p className="text-6xl font-bold text-gradient glow-text">
          {formatPercentile(percentile)}
        </p>
        <p className="text-gray-400 text-lg">of Base wallets</p>
      </div>

      {/* Wallet Order */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-1">Wallet Order</p>
        <p className="text-3xl font-mono font-bold text-white">
          {formatWalletOrder(stats.walletOrder)}
        </p>
      </div>

      {/* Tier Badge */}
      <TierBadge tier={tier} walletOrder={stats.walletOrder} size="lg" />

      {/* First Transaction Info */}
      <div className="bg-base-gray rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">First Base Transaction</span>
          <span className="text-white font-medium">{formatDate(stats.firstTxTimestamp)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Block Number</span>
          <span className="text-white font-mono text-sm">{stats.firstTxBlockNumber.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Transaction</span>
          <a
            href={getBasescanTxUrl(stats.firstTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-blue hover:underline font-mono text-sm truncate max-w-[200px]"
          >
            {stats.firstTxHash.slice(0, 10)}...{stats.firstTxHash.slice(-8)}
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onMint}
          disabled={isMinting}
          className="w-full py-4 px-6 bg-base-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 glow flex items-center justify-center gap-2"
        >
          {isMinting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Minting...
            </>
          ) : (
            <>
              <span>🏆</span>
              Mint Badge NFT
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span>
              Copied!
            </>
          ) : (
            <>
              <span>📋</span>
              Copy Results
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
