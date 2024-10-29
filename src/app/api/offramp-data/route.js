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
// Handle GET requests for the Offramp transactions
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const pageSize = searchParams.get('pageSize') || 20; // Default page size
  const pageOffset = searchParams.get('pageOffset') || 0; // Default page offset

  const path = `/v1/external/offramp`;
  const signature = generateSignature('GET', path);
  console.log(signature)

  try {
      const response = await fetch(`https://api-sandbox.gatefi.com${path}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&pageSize=${pageSize}&pageOffset=${pageOffset}`, {
          method: 'GET',
          headers: {
              'api-key': apiKey,
              'signature': signature,
          },
      });

      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch offramp transactions');
      }

      return NextResponse.json(data); // Return transaction data as JSON
  } catch (error) {
      console.error('Error fetching offramp transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 }); // Handle errors
  }
}