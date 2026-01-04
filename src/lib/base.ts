import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';

export interface WalletStats {
  address: Address;
  firstTxHash: string;
  firstTxBlockNumber: number;
  walletOrder: number;
  totalWallets: number;
  txCount?: number;
}

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function getFirstTransaction(address: Address): Promise<{
  hash: string;
  blockNumber: number;
  txCount?: number;
} | null> {
  try {
    // Use our API route to avoid CORS issues
    const response = await fetch(`/api/check-wallet?address=${address}`);
    const data = await response.json();

    console.log('API response:', data);

    if (data.success) {
      return {
        hash: data.hash,
        blockNumber: data.blockNumber || 0,
        txCount: data.txCount,
      };
    }

    console.log('No transactions found:', data.debug);
    return null;
  } catch (error) {
    console.error('Error fetching first transaction:', error);
    return null;
  }
}

// Estimate wallet order based on block number
// Base mainnet launched around block 1 in August 2023
// This is an approximation - in production you'd use an indexer
export async function estimateWalletOrder(blockNumber: number): Promise<{
  walletOrder: number;
  totalWallets: number;
}> {
  try {
    // Get current block for reference
    const currentBlock = await publicClient.getBlockNumber();

    // Rough estimation based on block progression
    // Base processes ~2 blocks per second on average
    // Early blocks had fewer unique wallets, later blocks have more

    // These are approximations - in production, use proper indexer data
    const BASE_LAUNCH_BLOCK = 1n;
    const WALLETS_PER_EARLY_BLOCK = 50; // First million blocks
    const WALLETS_PER_MID_BLOCK = 200; // 1M - 10M blocks
    const WALLETS_PER_LATE_BLOCK = 500; // After 10M blocks

    let estimatedOrder: number;
    const blockNum = BigInt(blockNumber);

    if (blockNum < 1_000_000n) {
      estimatedOrder = Number(blockNum) * WALLETS_PER_EARLY_BLOCK / 1000;
    } else if (blockNum < 10_000_000n) {
      estimatedOrder = 50_000 + (Number(blockNum - 1_000_000n) * WALLETS_PER_MID_BLOCK / 1000);
    } else {
      estimatedOrder = 50_000 + 1_800_000 + (Number(blockNum - 10_000_000n) * WALLETS_PER_LATE_BLOCK / 1000);
    }

    // Total wallets estimation
    const totalWallets = 50_000 + 1_800_000 + (Number(currentBlock - 10_000_000n) * WALLETS_PER_LATE_BLOCK / 1000);

    return {
      walletOrder: Math.max(1, Math.floor(estimatedOrder)),
      totalWallets: Math.floor(totalWallets),
    };
  } catch (error) {
    console.error('Error estimating wallet order:', error);
    // Fallback estimation
    return {
      walletOrder: Math.floor(blockNumber / 100),
      totalWallets: 15_000_000,
    };
  }
}

export async function getWalletStats(address: Address): Promise<WalletStats | null> {
  const firstTx = await getFirstTransaction(address);

  if (!firstTx) {
    return null;
  }

  // If we have txCount but no blockNumber, we know they have transactions
  // but we can't determine their exact order
  const { walletOrder, totalWallets } = await estimateWalletOrder(firstTx.blockNumber);

  return {
    address,
    firstTxHash: firstTx.hash,
    firstTxBlockNumber: firstTx.blockNumber,
    walletOrder,
    totalWallets,
    txCount: firstTx.txCount,
  };
}

export function getBasescanTxUrl(hash: string): string {
  return `https://basescan.org/tx/${hash}`;
}

export function getBasescanAddressUrl(address: string): string {
  return `https://basescan.org/address/${address}`;
}
