'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { WalletInput } from '@/components/WalletInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { getWalletStats, type WalletStats } from '@/lib/base';
import { getTierByOrder, calculatePercentile, TIERS } from '@/lib/tiers';
import { BADGE_NFT_ABI, BADGE_NFT_ADDRESS, MINT_PRICE } from '@/lib/nft';

type AppState = 'input' | 'loading' | 'results' | 'error' | 'no-transactions';

export default function Home() {
  const { address: connectedAddress } = useAccount();
  const [appState, setAppState] = useState<AppState>('input');
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState<string>('');

  const { writeContract, data: mintTxHash, isPending: isMintPending } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  const handleCheck = useCallback(async (address: Address) => {
    setAppState('loading');
    setError('');

    try {
      const stats = await getWalletStats(address);

      if (!stats) {
        setAppState('no-transactions');
        return;
      }

      setWalletStats(stats);
      setAppState('results');
    } catch (err) {
      console.error('Error checking wallet:', err);
      setError('Failed to check wallet. Please try again.');
      setAppState('error');
    }
  }, []);

  const handleMint = useCallback(() => {
    if (!walletStats || !connectedAddress) return;

    const tier = getTierByOrder(walletStats.walletOrder);
    const tierIndex = TIERS.findIndex(t => t.name === tier.name);
    const percentile = calculatePercentile(walletStats.walletOrder, walletStats.totalWallets);

    writeContract({
      address: BADGE_NFT_ADDRESS,
      abi: BADGE_NFT_ABI,
      functionName: 'mint',
      args: [
        BigInt(walletStats.walletOrder),
        BigInt(Math.floor(percentile * 100)), // Convert to basis points
        tierIndex,
        BigInt(walletStats.firstTxTimestamp),
      ],
      value: parseEther(MINT_PRICE.toString()),
    });
  }, [walletStats, connectedAddress, writeContract]);

  const handleReset = useCallback(() => {
    setAppState('input');
    setWalletStats(null);
    setError('');
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
          How Early on Base?
        </h1>
        <p className="text-gray-400">
          Discover when you first touched Base and flex your OG status
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {appState === 'input' && (
            <WalletInput onCheck={handleCheck} isLoading={false} />
          )}

          {appState === 'loading' && (
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <div className="w-20 h-20 mx-auto bg-base-blue rounded-full flex items-center justify-center">
                  <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xl font-medium text-white">Checking your wallet...</p>
                <p className="text-gray-400 mt-2">Scanning Base blockchain history</p>
              </div>
            </div>
          )}

          {appState === 'results' && walletStats && (
            <ResultsDisplay
              stats={walletStats}
              onMint={handleMint}
              onReset={handleReset}
              isMinting={isMintPending || isMintConfirming}
            />
          )}

          {appState === 'no-transactions' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-4xl">
                🤷
              </div>
              <div>
                <p className="text-xl font-medium text-white">No Base transactions found</p>
                <p className="text-gray-400 mt-2">
                  This wallet hasn't made any transactions on Base yet.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Another Wallet
              </button>
            </div>
          )}

          {appState === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center text-4xl">
                ❌
              </div>
              <div>
                <p className="text-xl font-medium text-white">Something went wrong</p>
                <p className="text-gray-400 mt-2">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Mint Success Toast */}
          {isMintSuccess && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <span>✓</span>
              Badge minted successfully!
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>Built on Base</p>
      </footer>
    </main>
  );
}
