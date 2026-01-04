import { NextRequest, NextResponse } from 'next/server';

// CDP APIs
const CDP_NODE_URL = process.env.CDP_NODE_URL || 'https://api.developer.coinbase.com/rpc/v1/base/mainnet';
const CDP_SQL_URL = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';
const CDP_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || '0x552579710587F0F934d640DdEB2D9BEE10a96553';

  const results: any = {
    address: address.toLowerCase(),
    apiKeyPresent: !!CDP_API_KEY,
    apiKeyPreview: CDP_API_KEY ? `${CDP_API_KEY.slice(0, 8)}...` : 'MISSING',
    nodeUrl: CDP_NODE_URL,
    tests: {},
  };

  // Test 1: cdp_listAddressTransactions
  try {
    const rpcPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'cdp_listAddressTransactions',
      params: [{ address: address.toLowerCase(), pageSize: 5, pageToken: '' }]
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
    results.tests.listTransactions = {
      status: response.status,
      hasResult: !!data.result,
      resultLength: data.result?.length || 0,
      error: data.error,
      sample: data.result?.[0] ? {
        hash: data.result[0].hash,
        blockHeight: data.result[0].blockHeight,
        keys: Object.keys(data.result[0]),
      } : null,
    };
  } catch (error) {
    results.tests.listTransactions = { error: String(error) };
  }

  // Test 2: SQL API - simple query
  try {
    const sqlQuery = 'SELECT * FROM base.transactions LIMIT 1';

    const response = await fetch(CDP_SQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CDP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: sqlQuery }),
    });

    const data = await response.json();
    results.tests.sqlSimple = {
      status: response.status,
      query: sqlQuery,
      hasRows: !!data.rows,
      rowCount: data.rows?.length || 0,
      schema: data.schema,
      error: data.error || data.message,
      rawResponse: JSON.stringify(data).slice(0, 500),
    };
  } catch (error) {
    results.tests.sqlSimple = { error: String(error) };
  }

  // Test 3: SQL API - count query
  try {
    const sqlQuery = 'SELECT COUNT(*) as cnt FROM base.transactions LIMIT 1';

    const response = await fetch(CDP_SQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CDP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: sqlQuery }),
    });

    const data = await response.json();
    results.tests.sqlCount = {
      status: response.status,
      query: sqlQuery,
      result: data.rows,
      error: data.error || data.message,
    };
  } catch (error) {
    results.tests.sqlCount = { error: String(error) };
  }

  // Test 4: eth_getTransactionCount
  try {
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionCount',
      params: [address.toLowerCase(), 'latest']
    };

    const response = await fetch(CDP_NODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CDP_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    results.tests.txCount = {
      status: response.status,
      result: data.result,
      decimal: data.result ? parseInt(data.result, 16) : 0,
      error: data.error,
    };
  } catch (error) {
    results.tests.txCount = { error: String(error) };
  }

  return NextResponse.json(results, { status: 200 });
}
