'use client';

import { useState, useCallback } from 'react';
import { type Address } from 'viem';
import { WalletInput } from '@/components/WalletInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { getWalletStats, type WalletStats } from '@/lib/base';

type AppState = 'input' | 'loading' | 'results' | 'error' | 'no-transactions';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState<string>('');

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

  const handleReset = useCallback(() => {
    setAppState('input');
    setWalletStats(null);
    setError('');
  }, []);

  return (
    <main className="min-h-screen flex flex-col safe-area-inset">
      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold text-gradient">
          How Early on Base?
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Discover your OG status
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {appState === 'input' && (
            <WalletInput onCheck={handleCheck} isLoading={false} />
          )}

          {appState === 'loading' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-base-blue rounded-full flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
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
              <div>
                <p className="text-lg font-medium text-white">Checking wallet...</p>
                <p className="text-gray-400 text-sm">Scanning Base history</p>
              </div>
            </div>
          )}

          {appState === 'results' && walletStats && (
            <ResultsDisplay
              stats={walletStats}
              onReset={handleReset}
            />
          )}

          {appState === 'no-transactions' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                🤷
              </div>
              <div>
                <p className="text-lg font-medium text-white">No Base transactions</p>
                <p className="text-gray-400 text-sm">
                  This wallet hasn't transacted on Base yet.
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
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center text-3xl">
                ❌
              </div>
              <div>
                <p className="text-lg font-medium text-white">Something went wrong</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-xs">
        <p>Built on Base</p>
      </footer>
    </main>
  );
}
