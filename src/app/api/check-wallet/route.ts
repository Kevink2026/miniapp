import { NextRequest, NextResponse } from 'next/server';

const CDP_API_URL = 'https://api.developer.coinbase.com/rpc/v1/base';
const CDP_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

// Fallback to BaseScan if CDP doesn't work
const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';
const BASESCAN_API_URL = 'https://api.basescan.org/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Try BaseScan first (more reliable for transaction history)
  try {
    const txUrl = `${BASESCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${BASESCAN_API_KEY}`;

    console.log('Fetching from BaseScan for address:', address);

    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();

    console.log('BaseScan response status:', txData.status, 'message:', txData.message);

    if (txData.status === '1' && txData.result && txData.result.length > 0) {
      const tx = txData.result[0];
      console.log('Found transaction:', tx.hash);
      return NextResponse.json({
        success: true,
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        blockNumber: parseInt(tx.blockNumber),
      });
    }

    // Try internal transactions
    const internalUrl = `${BASESCAN_API_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${BASESCAN_API_KEY}`;
    const internalResponse = await fetch(internalUrl);
    const internalData = await internalResponse.json();

    if (internalData.status === '1' && internalData.result && internalData.result.length > 0) {
      const tx = internalData.result[0];
      return NextResponse.json({
        success: true,
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        blockNumber: parseInt(tx.blockNumber),
      });
    }

    // Try ERC20 token transfers
    const tokenUrl = `${BASESCAN_API_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${BASESCAN_API_KEY}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    console.log('BaseScan token response:', tokenData.status, tokenData.message);

    if (tokenData.status === '1' && tokenData.result && tokenData.result.length > 0) {
      const tx = tokenData.result[0];
      return NextResponse.json({
        success: true,
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        blockNumber: parseInt(tx.blockNumber),
      });
    }

    // No transactions found
    return NextResponse.json({
      success: false,
      error: 'No transactions found',
      debug: {
        address: address,
        txStatus: txData.status,
        txMessage: txData.message,
        txResult: txData.result,
        apiKeyPresent: !!BASESCAN_API_KEY,
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transaction data',
      details: String(error)
    }, { status: 500 });
  }
}
