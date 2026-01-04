import { NextRequest, NextResponse } from 'next/server';

// CDP APIs
const CDP_NODE_URL = process.env.CDP_NODE_URL || 'https://api.developer.coinbase.com/rpc/v1/base/mainnet';
const CDP_SQL_URL = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';
const CDP_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

// Get wallet order using CDP SQL API
async function getWalletOrderFromSQL(blockNumber: number): Promise<{ walletOrder: number; totalWallets: number } | null> {
  try {
    // Query to count unique addresses that transacted before this block
    const walletOrderQuery = `
      SELECT COUNT(DISTINCT from_address) as wallet_count
      FROM base.transactions
      WHERE block_number < ${blockNumber}
    `;

    // Query to get total unique wallets
    const totalWalletsQuery = `
      SELECT COUNT(DISTINCT from_address) as total_count
      FROM base.transactions
    `;

    const headers = {
      'Authorization': `Bearer ${CDP_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // Run both queries in parallel
    const [orderResponse, totalResponse] = await Promise.all([
      fetch(CDP_SQL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql: walletOrderQuery }),
      }),
      fetch(CDP_SQL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql: totalWalletsQuery }),
      }),
    ]);

    const orderData = await orderResponse.json();
    const totalData = await totalResponse.json();

    console.log('SQL order response:', JSON.stringify(orderData).slice(0, 500));
    console.log('SQL total response:', JSON.stringify(totalData).slice(0, 500));

    // Parse results
    let walletOrder = 0;
    let totalWallets = 0;

    if (orderData.rows && orderData.rows.length > 0) {
      walletOrder = parseInt(orderData.rows[0].wallet_count || orderData.rows[0][0], 10) + 1; // +1 because we want position
    }

    if (totalData.rows && totalData.rows.length > 0) {
      totalWallets = parseInt(totalData.rows[0].total_count || totalData.rows[0][0], 10);
    }

    if (walletOrder > 0 && totalWallets > 0) {
      return { walletOrder, totalWallets };
    }

    return null;
  } catch (error) {
    console.error('CDP SQL API Error:', error);
    return null;
  }
}

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
    const maxPages = 50;

    // Paginate through all transactions
    do {
      const rpcPayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'cdp_listAddressTransactions',
        params: [
          {
            address: address.toLowerCase(),
            pageSize: 100,
            pageToken: pageToken
          }
        ]
      };

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
        pageToken = data.nextPageToken || '';
      } else {
        break;
      }

      pageCount++;
    } while (pageToken && pageCount < maxPages);

    console.log(`Total transactions found: ${allTransactions.length}`);

    if (allTransactions.length > 0) {
      // Find the transaction with the LOWEST blockHeight (oldest)
      let oldestTx = allTransactions[0];
      let lowestBlock = parseInt(oldestTx.blockHeight, 10) || Infinity;

      for (const tx of allTransactions) {
        const blockHeight = parseInt(tx.blockHeight, 10);
        if (blockHeight && blockHeight < lowestBlock) {
          lowestBlock = blockHeight;
          oldestTx = tx;
        }
      }

      console.log(`Oldest transaction at block ${lowestBlock}`);

      // Try to get EXACT wallet order using SQL API
      const sqlResult = await getWalletOrderFromSQL(lowestBlock);

      if (sqlResult) {
        return NextResponse.json({
          success: true,
          hash: oldestTx.hash,
          blockNumber: lowestBlock,
          blockHash: oldestTx.blockHash,
          totalTransactions: allTransactions.length,
          walletOrder: sqlResult.walletOrder,
          totalWallets: sqlResult.totalWallets,
          isExact: true, // Flag that this is exact data, not estimated
        });
      }

      // Fallback: return without wallet order (will be estimated client-side)
      return NextResponse.json({
        success: true,
        hash: oldestTx.hash,
        blockNumber: lowestBlock,
        blockHash: oldestTx.blockHash,
        totalTransactions: allTransactions.length,
        isExact: false,
      });
    }

    // Fallback: check transaction count
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

    if (txCount > 0) {
      return NextResponse.json({
        success: true,
        hash: 'unknown',
        blockNumber: 0,
        totalTransactions: txCount,
        isExact: false,
        note: 'Has sent transactions but details unavailable'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: address.toLowerCase(),
        pagesChecked: pageCount,
        transactionsFound: allTransactions.length,
      }
    });

  } catch (error) {
    console.error('CDP API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
      details: String(error)
    }, { status: 500 });
  }
}
