'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { isAddress, type Address } from 'viem';

interface WalletInputProps {
  onCheck: (address: Address) => void;
  isLoading: boolean;
}

export function WalletInput({ onCheck, isLoading }: WalletInputProps) {
  const { walletAddress } = useMiniKit();
  const [manualAddress, setManualAddress] = useState('');
  const [error, setError] = useState('');

  // Auto-check connected wallet on mount
  useEffect(() => {
    if (walletAddress && isAddress(walletAddress)) {
      onCheck(walletAddress as Address);
    }
  }, [walletAddress, onCheck]);

  const handleManualCheck = () => {
    if (!manualAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isAddress(manualAddress)) {
      setError('Invalid Ethereum address');
      return;
    }

    setError('');
    onCheck(manualAddress as Address);
  };

  const handleConnectedCheck = () => {
    if (walletAddress && isAddress(walletAddress)) {
      onCheck(walletAddress as Address);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Connected Wallet Button */}
      {walletAddress && (
        <button
          onClick={handleConnectedCheck}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-base-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 glow"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking...
            </span>
          ) : (
            'Check My Wallet'
          )}
        </button>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-gray-500 text-sm">or enter an address</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      {/* Manual Address Input */}
      <div className="space-y-3">
        <input
          type="text"
          value={manualAddress}
          onChange={(e) => {
            setManualAddress(e.target.value);
            setError('');
          }}
          placeholder="0x..."
          className="w-full px-4 py-3 bg-base-gray border border-gray-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-base-blue transition-colors"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handleManualCheck}
          disabled={isLoading || !manualAddress}
          className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200"
        >
          {isLoading ? 'Checking...' : 'Check Address'}
        </button>
      </div>
    </div>
  );
}
