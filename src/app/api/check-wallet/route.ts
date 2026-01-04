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
    // Try CDP Advanced API method
    const rpcPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'coinbaseCloud_getTransactionsByAddress',
      params: {
        address: address,
        blockStart: '0x1',
        blockEnd: 'latest',
        addressFilter: 'SENDER_OR_RECEIVER',
        sort: 'asc',
        pageSize: 1,
      }
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
    console.log('CDP Node response:', JSON.stringify(data).slice(0, 500));

    if (data.result && data.result.transactions && data.result.transactions.length > 0) {
      const tx = data.result.transactions[0];
      return NextResponse.json({
        success: true,
        hash: tx.transactionHash || tx.hash,
        timestamp: parseInt(tx.blockTimestamp, 16) || Math.floor(Date.now() / 1000),
        blockNumber: parseInt(tx.blockNumber, 16),
      });
    }

    // If advanced method not available, try standard eth_getLogs for transfers
    const logsPayload = {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getLogs',
      params: [{
        fromBlock: '0x1',
        toBlock: 'latest',
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
          null,
          '0x000000000000000000000000' + address.slice(2).toLowerCase(), // to address
        ],
      }]
    };

    const logsResponse = await fetch(CDP_NODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CDP_API_KEY}`,
      },
      body: JSON.stringify(logsPayload),
    });

    const logsData = await logsResponse.json();
    console.log('CDP Logs response:', JSON.stringify(logsData).slice(0, 500));

    if (logsData.result && logsData.result.length > 0) {
      const log = logsData.result[0];
      return NextResponse.json({
        success: true,
        hash: log.transactionHash,
        timestamp: Math.floor(Date.now() / 1000), // We don't have timestamp from logs
        blockNumber: parseInt(log.blockNumber, 16),
      });
    }

    // No transactions found
    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: address,
        cdpResponse: data,
        logsResponse: logsData,
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
