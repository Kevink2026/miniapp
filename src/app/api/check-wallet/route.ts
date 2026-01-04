import { NextRequest, NextResponse } from 'next/server';

const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';
const BASESCAN_API_URL = 'https://api.basescan.org/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    // Fetch normal transactions
    const txUrl = `${BASESCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${BASESCAN_API_KEY}`;
    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();

    console.log('BaseScan txlist response:', JSON.stringify(txData).slice(0, 300));

    if (txData.status === '1' && txData.result && txData.result.length > 0) {
      const tx = txData.result[0];
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

    console.log('BaseScan internal response:', JSON.stringify(internalData).slice(0, 300));

    if (internalData.status === '1' && internalData.result && internalData.result.length > 0) {
      const tx = internalData.result[0];
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
        txStatus: txData.status,
        txMessage: txData.message,
        internalStatus: internalData.status,
        internalMessage: internalData.message,
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch from BaseScan'
    }, { status: 500 });
  }
}
