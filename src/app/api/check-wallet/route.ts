import { NextRequest, NextResponse } from 'next/server';

// CDP Node RPC endpoint for Base
const CDP_NODE_URL = process.env.CDP_NODE_URL || 'https://api.developer.coinbase.com/rpc/v1/base/mainnet';
const CDP_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    // Use correct CDP method: cdp_listAddressTransactions
    // Important: address must be lowercase!
    const rpcPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'cdp_listAddressTransactions',
      params: [
        {
          address: address.toLowerCase(),
          pageSize: 1,
          pageToken: ''
        }
      ]
    };

    console.log('CDP Node RPC request:', JSON.stringify(rpcPayload));

    const response = await fetch(CDP_NODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CDP_API_KEY}`,
      },
      body: JSON.stringify(rpcPayload),
    });

    const data = await response.json();
    console.log('CDP Node response:', JSON.stringify(data).slice(0, 1000));

    // Check for CDP response format
    if (data.result && data.result.length > 0) {
      const tx = data.result[0];
      return NextResponse.json({
        success: true,
        hash: tx.hash,
        blockNumber: parseInt(tx.blockHeight, 10),
        blockHash: tx.blockHash,
        status: tx.status,
      });
    }

    // If no results from cdp_listAddressTransactions, try eth_getTransactionCount
    // This at least tells us if the address has sent transactions
    const countPayload = {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getTransactionCount',
      params: [address.toLowerCase(), 'latest']
    };

    const countResponse = await fetch(CDP_NODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CDP_API_KEY}`,
      },
      body: JSON.stringify(countPayload),
    });

    const countData = await countResponse.json();
    console.log('Transaction count response:', JSON.stringify(countData));

    const txCount = parseInt(countData.result, 16);

    if (txCount > 0) {
      // Address has sent transactions, but we couldn't get the first one
      // Return a partial result
      return NextResponse.json({
        success: true,
        hash: 'unknown',
        blockNumber: 0,
        txCount: txCount,
        note: 'Wallet has transactions but first tx details unavailable'
      });
    }

    // No transactions found
    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: address.toLowerCase(),
        cdpResponse: data,
        txCount: txCount,
        nodeUrl: CDP_NODE_URL,
        apiKeyPresent: !!CDP_API_KEY,
      }
    });

  } catch (error) {
    console.error('CDP Node API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch from CDP Node',
      details: String(error)
    }, { status: 500 });
  }
}
