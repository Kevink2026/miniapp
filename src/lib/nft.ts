import { type Address } from 'viem';

// NFT Badge Contract ABI (Soulbound ERC-721)
export const BADGE_NFT_ABI = [
  {
    inputs: [
      { name: 'walletOrder', type: 'uint256' },
      { name: 'percentile', type: 'uint256' },
      { name: 'tierIndex', type: 'uint8' },
      { name: 'firstTxTimestamp', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'hasMinted',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address (to be deployed)
export const BADGE_NFT_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

// Mint price in ETH
export const MINT_PRICE = 0.001; // 0.001 ETH

export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

export function generateBadgeMetadata(
  walletOrder: number,
  percentile: number,
  tierName: string,
  firstTxDate: string
): BadgeMetadata {
  return {
    name: `Base Early Badge #${walletOrder}`,
    description: `This wallet was the ${walletOrder.toLocaleString()}th wallet on Base, earlier than ${percentile.toFixed(1)}% of all wallets. Tier: ${tierName}`,
    image: '', // Would be generated or stored on IPFS
    attributes: [
      { trait_type: 'Wallet Order', value: walletOrder },
      { trait_type: 'Percentile', value: `${percentile.toFixed(1)}%` },
      { trait_type: 'Tier', value: tierName },
      { trait_type: 'First Transaction', value: firstTxDate },
      { trait_type: 'Version', value: 'v1' },
    ],
  };
}
