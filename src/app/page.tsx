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
  const [manualAddress, setManualAddress] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);

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
    setManualAddress('');
    setIsManualMode(false);
    if (address && !isManualMode) {
      handleCheck(address);
    }
  }, [address, handleCheck, isManualMode]);

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleManualCheck = () => {
    // Validate address format (Ethereum addresses are 42 chars: 0x + 40 hex chars)
    const trimmedAddress = manualAddress.trim();
    if (!trimmedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid address format. Please enter a valid Ethereum address.');
      setAppState('error');
      return;
    }
    setIsManualMode(true);
    handleCheck(trimmedAddress as Address);
  };

  const switchToManualMode = () => {
    setIsManualMode(true);
    setAppState('connecting');
    setWalletStats(null);
    setError('');
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

          {/* Not connected - show connect button and manual lookup */}
          {!isConnected && !isConnecting && !isManualMode && (
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
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-base-dark text-gray-500">or</span>
                </div>
              </div>
              <button
                onClick={switchToManualMode}
                className="w-full py-3 px-6 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-colors"
              >
                Check Any Address
              </button>
            </div>
          )}

          {/* Manual address lookup */}
          {!isConnected && !isConnecting && isManualMode && appState !== 'loading' && appState !== 'results' && appState !== 'no-transactions' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-base-blue/20 rounded-full flex items-center justify-center text-4xl">
                🔍
              </div>
              <div>
                <p className="text-lg font-medium text-white">Check any address</p>
                <p className="text-gray-400 text-sm mt-1">
                  Enter a wallet address to check
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualCheck()}
                  placeholder="0x..."
                  className="w-full py-3 px-4 bg-base-gray border border-gray-700 focus:border-base-blue text-white font-mono rounded-xl outline-none transition-colors"
                />
                <button
                  onClick={handleManualCheck}
                  disabled={!manualAddress.trim()}
                  className="w-full py-4 px-6 bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-200 glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Address
                </button>
              </div>
              <button
                onClick={() => setIsManualMode(false)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to connect
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
          {appState === 'loading' && (
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
                {(address || manualAddress) && (
                  <p className="text-gray-500 text-xs mt-2 font-mono">
                    {isManualMode
                      ? `${manualAddress.slice(0, 6)}...${manualAddress.slice(-4)}`
                      : address && `${address.slice(0, 6)}...${address.slice(-4)}`
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {appState === 'results' && walletStats && (
            <ResultsDisplay
              stats={walletStats}
              onReset={handleReset}
            />
          )}

          {/* No transactions */}
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
                {(address || manualAddress) && (
                  <p className="text-gray-500 text-xs mt-2 font-mono">
                    {isManualMode
                      ? `${manualAddress.slice(0, 6)}...${manualAddress.slice(-4)}`
                      : address && `${address.slice(0, 6)}...${address.slice(-4)}`
                    }
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-base-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
              >
                {isManualMode ? 'Check Another Address' : 'Try Again'}
              </button>
            </div>
          )}

          {/* Error */}
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
                {isManualMode ? 'Try Another Address' : 'Try Again'}
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
