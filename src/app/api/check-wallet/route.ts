import { NextRequest, NextResponse } from 'next/server';

const CDP_SQL_API_URL = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';
const CDP_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const lowerAddress = address.toLowerCase();

  try {
    // Query for first transaction (sent or received)
    const sql = `
      SELECT
        block_number,
        block_timestamp,
        transaction_hash
      FROM base.transactions
      WHERE from_address = '${lowerAddress}' OR to_address = '${lowerAddress}'
      ORDER BY block_number ASC
      LIMIT 1
    `;

    console.log('CDP SQL Query:', sql);
    console.log('API Key present:', !!CDP_API_KEY);

    const response = await fetch(CDP_SQL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CDP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const data = await response.json();
    console.log('CDP Response:', JSON.stringify(data).slice(0, 500));

    if (data.rows && data.rows.length > 0) {
      const row = data.rows[0];
      // CDP returns columns in order: block_number, block_timestamp, transaction_hash
      return NextResponse.json({
        success: true,
        hash: row[2], // transaction_hash
        timestamp: Math.floor(new Date(row[1]).getTime() / 1000), // block_timestamp
        blockNumber: parseInt(row[0]), // block_number
      });
    }

    // Try transfers table (ERC-20, ERC-721, etc.)
    const transfersSql = `
      SELECT
        block_number,
        block_timestamp,
        transaction_hash
      FROM base.transfers
      WHERE from_address = '${lowerAddress}' OR to_address = '${lowerAddress}'
      ORDER BY block_number ASC
      LIMIT 1
    `;

    const transfersResponse = await fetch(CDP_SQL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CDP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: transfersSql }),
    });

    const transfersData = await transfersResponse.json();
    console.log('CDP Transfers Response:', JSON.stringify(transfersData).slice(0, 500));

    if (transfersData.rows && transfersData.rows.length > 0) {
      const row = transfersData.rows[0];
      return NextResponse.json({
        success: true,
        hash: row[2],
        timestamp: Math.floor(new Date(row[1]).getTime() / 1000),
        blockNumber: parseInt(row[0]),
      });
    }

    // No transactions found
    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: lowerAddress,
        cdpResponse: data,
        transfersResponse: transfersData,
        apiKeyPresent: !!CDP_API_KEY,
      }
    });

  } catch (error) {
    console.error('CDP API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch from CDP',
      details: String(error)
    }, { status: 500 });
  }
}
