'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { type Address } from 'viem';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { getWalletStats, type WalletStats } from '@/lib/base';

type AppState = 'connecting' | 'loading' | 'results' | 'error' | 'no-transactions';

export default function Home() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();

  const [appState, setAppState] = useState<AppState>('connecting');
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState<string>('');
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = useCallback(async (walletAddress: Address) => {
    setAppState('loading');
    setError('');

    try {
      const stats = await getWalletStats(walletAddress);

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

  // Auto-check when wallet connects
  useEffect(() => {
    if (isConnected && address && !hasChecked) {
      setHasChecked(true);
      handleCheck(address);
    }
  }, [isConnected, address, hasChecked, handleCheck]);

  const handleReset = useCallback(() => {
    setHasChecked(false);
    setWalletStats(null);
    setError('');
    if (address) {
      handleCheck(address);
    }
  }, [address, handleCheck]);

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

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

          {/* Not connected - show connect button */}
          {!isConnected && !isConnecting && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-base-blue/20 rounded-full flex items-center justify-center text-4xl">
                🔵
              </div>
              <div>
                <p className="text-lg font-medium text-white">Connect your wallet</p>
                <p className="text-gray-400 text-sm mt-1">
                  to see how early you are on Base
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="w-full py-4 px-6 bg-base-blue hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 glow"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* Connecting */}
          {isConnecting && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-base-blue rounded-full flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white">Connecting...</p>
            </div>
          )}

          {/* Loading wallet data */}
          {isConnected && appState === 'loading' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-base-blue rounded-full flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-white">Checking wallet...</p>
                <p className="text-gray-400 text-sm">Scanning Base history</p>
                {address && (
                  <p className="text-gray-500 text-xs mt-2 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {isConnected && appState === 'results' && walletStats && (
            <ResultsDisplay
              stats={walletStats}
              onReset={handleReset}
            />
          )}

          {/* No transactions */}
          {isConnected && appState === 'no-transactions' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                🤷
              </div>
              <div>
                <p className="text-lg font-medium text-white">No Base transactions</p>
                <p className="text-gray-400 text-sm">
                  This wallet hasn't transacted on Base yet.
                </p>
                {address && (
                  <p className="text-gray-500 text-xs mt-2 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Error */}
          {isConnected && appState === 'error' && (
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
