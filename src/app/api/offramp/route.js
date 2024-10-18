// src/app/api/offramp/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Access environment variables or hard-coded keys (use env vars in production)
const apiKey = "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq";
const secretKey = "GSLDrYtqLmXDJRHbqtUwDQLwKBbEgPvu";

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
    const { customerId, type, fiatAccountFields } = body;

    // Validate required fields
    if (!customerId || !type || !fiatAccountFields) {
      return NextResponse.json(
        { error: 'customerId, type, and fiatAccountFields are required.' },
        { status: 400 }
      );
    }

    // Validate type - Only SEPA is allowed
    if (type !== 'SEPA') {
      return NextResponse.json(
        { error: 'Invalid type. Only SEPA is supported.' },
        { status: 400 }
      );
    }

    // Define the correct API path
    const path = `/v1/external/fiatAccounts`; // Updated path
    const signature = generateSignature('POST', path);

    // **Log method, path, and signature for debugging**
    console.log(`Method: POST`);
    console.log(`Path: ${path}`);
    console.log(`Generated Signature: ${signature}`);

    // Make the external API request
    const response = await fetch(`https://api-sandbox.gatefi.com${path}`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, type, fiatAccountFields }),
    });

    // **Log the response status and body**
    console.log(`External API Response Status: ${response.status}`);
    const data = await response.json();
    console.log(`External API Response Body:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add fiat account.');
    }

    // Return the successful response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in Add Fiat Account API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
