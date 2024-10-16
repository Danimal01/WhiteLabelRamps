import { NextResponse } from 'next/server';
import crypto from 'crypto';

const apiKey = 'VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq';
const secretKey = 'GSLDrYtqLmXDJRHbqtUwDQLwKBbEgPvu';

function generateSignature(method, path) {
  const data = method + path;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data);
  return hmac.digest('hex');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }

  const path = `/v1/external/kyc/requirements`; // Ensure this path is correct
  const signature = generateSignature('GET', path);

  try {
    const response = await fetch(`https://api-sandbox.gatefi.com${path}?country=${encodeURIComponent(country)}`, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'signature': signature,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch KYC requirements');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /kyc/requirements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  let path, signature;

  if (body.action === 'createCustomer') {
    path = `/v1/external/customers`; // Ensure this path is correct
    signature = generateSignature('POST', path);

    try {
      const response = await fetch(`https://api-sandbox.gatefi.com${path}`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'signature': signature,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create customer');
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error('Error in createCustomer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.action === 'addKycMetadata') {
    path = `/v1/external/customers/${body.customerId}/kyc`; // Ensure this path is correct
    signature = generateSignature('POST', path);

    try {
      const response = await fetch(`https://api-sandbox.gatefi.com${path}`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'signature': signature,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kycSubmission: body.kycSubmission }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add KYC metadata');
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error('Error in addKycMetadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.action === 'submitKycForReview') {
    path = `/v1/external/customers/${body.customerId}/kyc/${body.submissionId}/submit`; // Ensure this path is correct
    signature = generateSignature('POST', path);

    try {
      const response = await fetch(`https://api-sandbox.gatefi.com${path}`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'signature': signature,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit KYC for review');
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error('Error in submitKycForReview:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.action === 'getKycWidgetUrl') {
    const { customerId, successUrl, cancelUrl } = body;

    try {
      // Get Auth Token - Modified to use query parameter
      path = `/v1/external/auth-token`; // Ensure this path is correct
      const authTokenPathWithQuery = `${path}?customerId=${encodeURIComponent(customerId)}`;
      signature = generateSignature('POST', path);

      const authTokenResponse = await fetch(`https://api-sandbox.gatefi.com${authTokenPathWithQuery}`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'signature': signature,
          'Content-Type': 'application/json',
        },
        // Removed body since customerId is sent as query parameter
      });

      const authTokenData = await authTokenResponse.json();

      if (!authTokenResponse.ok) {
        throw new Error(authTokenData.message || 'Failed to get auth token');
      }

      // Get KYC Widget URL
      path = `/v1/external/customers/${encodeURIComponent(customerId)}/kyc/widgetUrl`; // Ensure this path is correct
      signature = generateSignature('POST', path);
      const kycWidgetUrlResponse = await fetch(`https://api-sandbox.gatefi.com${path}`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'signature': signature,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ successUrl, cancelUrl }),
      });

      const kycWidgetUrlData = await kycWidgetUrlResponse.json();

      if (!kycWidgetUrlResponse.ok) {
        throw new Error(kycWidgetUrlData.message || 'Failed to get KYC Widget URL');
      }

      // Combine responses
      const fullKycUrl = `${kycWidgetUrlData.kycUrl}&ucToken=${encodeURIComponent(authTokenData.authToken)}`;

      return NextResponse.json({
        kycUrl: fullKycUrl,
        submissionId: kycWidgetUrlData.submissionId
      });
    } catch (error) {
      console.error('Error in getKycWidgetUrl:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
