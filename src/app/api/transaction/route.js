// src/app/api/offramp/transaction.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const apiKey = "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq";
const secretKey = "GSLDrYtqLmXDJRHbqtUwDQLwKBbEgPvu";

// Function to generate signature
// Function to generate signature
function generateSignature(method, path) {
  const data = method.toUpperCase() + path; // Ensure method is uppercase
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data);
  return hmac.digest('hex');
}
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, quoteId, fromCurrency, toCurrency, amount, fiatAccountId, chain } = body;

    // Validation
    if (!customerId || !quoteId || !fromCurrency || !toCurrency || !amount || !fiatAccountId) {
      return NextResponse.json(
        { error: 'customerId, quoteId, fromCurrency, toCurrency, amount, and fiatAccountId are required.' },
        { status: 400 }
      );
    }

    const path = '/v1/external/offramp'; 
    const signature = generateSignature('POST', path);
    console.log(signature)

    // API request to initiate offramp transaction
    const response = await fetch(`https://api-sandbox.gatefi.com${path}`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, quoteId, fromCurrency, toCurrency, amount, fiatAccountId, chain }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('API Response:', data);
      throw new Error(data.error || 'Failed to initiate offramp transaction.');
    }

    

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in Initiate Offramp Transaction API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}