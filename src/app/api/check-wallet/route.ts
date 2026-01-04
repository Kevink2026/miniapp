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
    // Get ALL transactions for this address and find the oldest one
    let allTransactions: any[] = [];
    let pageToken = '';
    let pageCount = 0;
    const maxPages = 50; // Limit to prevent infinite loops

    // Paginate through all transactions
    do {
      const rpcPayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'cdp_listAddressTransactions',
        params: [
          {
            address: address.toLowerCase(),
            pageSize: 100, // Get max per page
            pageToken: pageToken
          }
        ]
      };

      console.log(`Fetching page ${pageCount + 1}...`);

      const response = await fetch(CDP_NODE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CDP_API_KEY}`,
        },
        body: JSON.stringify(rpcPayload),
      });

      const data = await response.json();

      if (data.error) {
        console.error('CDP API Error:', data.error);
        break;
      }

      if (data.result && Array.isArray(data.result)) {
        allTransactions = allTransactions.concat(data.result);
        // Check if there's a nextPageToken in the response
        pageToken = data.nextPageToken || '';
      } else {
        break;
      }

      pageCount++;
    } while (pageToken && pageCount < maxPages);

    console.log(`Total transactions found: ${allTransactions.length}`);

    if (allTransactions.length > 0) {
      // Find the transaction with the LOWEST blockHeight (oldest transaction)
      let oldestTx = allTransactions[0];
      let lowestBlock = parseInt(oldestTx.blockHeight, 10) || Infinity;

      for (const tx of allTransactions) {
        const blockHeight = parseInt(tx.blockHeight, 10);
        if (blockHeight && blockHeight < lowestBlock) {
          lowestBlock = blockHeight;
          oldestTx = tx;
        }
      }

      console.log(`Oldest transaction at block ${lowestBlock}:`, oldestTx.hash);

      return NextResponse.json({
        success: true,
        hash: oldestTx.hash,
        blockNumber: lowestBlock,
        blockHash: oldestTx.blockHash,
        totalTransactions: allTransactions.length,
      });
    }

    // Fallback: check transaction count (only counts SENT transactions)
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
    const txCount = parseInt(countData.result, 16);

    console.log(`Transaction count (sent only): ${txCount}`);

    if (txCount > 0) {
      return NextResponse.json({
        success: true,
        hash: 'unknown',
        blockNumber: 0,
        totalTransactions: txCount,
        note: 'Has sent transactions but details unavailable'
      });
    }

    // No transactions found
    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: address.toLowerCase(),
        pagesChecked: pageCount,
        transactionsFound: allTransactions.length,
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
