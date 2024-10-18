// src/app/api/quotes/route.js

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
    const { chain, fromAmount, fromCurrency, paymentMethodType, toCurrency, toAmount, metadata } = body;

    // Validate required fields
    if (!fromCurrency || !toCurrency || !paymentMethodType) {
      return NextResponse.json(
        { error: 'fromCurrency, toCurrency, and paymentMethodType are required.' },
        { status: 400 }
      );
    }

    // Validate that at least one of fromAmount or toAmount is provided, but not both
    if ((fromAmount && toAmount) || (!fromAmount && !toAmount)) {
      return NextResponse.json(
        { error: 'Provide either fromAmount or toAmount, but not both.' },
        { status: 400 }
      );
    }

    // If metadata is provided, ensure it's valid JSON
    let parsedMetadata = null;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (err) {
        return NextResponse.json(
          { error: 'Metadata must be a valid JSON string.' },
          { status: 400 }
        );
      }
    }

    // Construct the request body
    const requestBody = {
      ...(chain && { chain }),
      ...(fromAmount && { fromAmount }),
      fromCurrency,
      paymentMethodType,
      toCurrency,
      ...(toAmount && { toAmount }),
      ...(parsedMetadata && { metadata: parsedMetadata }),
    };

    // Define the correct API path
    const path = `/v1/external/quotes`; // Assuming the external API path is /v1/external/quotes
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
      body: JSON.stringify(requestBody),
    });

    // **Log the response status and body**
    console.log(`External API Response Status: ${response.status}`);
    const data = await response.json();
    console.log(`External API Response Body:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create quote.');
    }

    // Return the successful response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in Create Quote API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
