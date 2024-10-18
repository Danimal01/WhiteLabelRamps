// src/app/offramp/page.js

'use client';

import React, { useState } from 'react';

const Offramp = () => {
  // **State for Quotes Form**
  const [quoteData, setQuoteData] = useState({
    chain: '',
    fromAmount: '',
    fromCurrency: '',
    paymentMethodType: '',
    toCurrency: '',
    toAmount: '',
    metadata: '',
  });
  const [quoteResponse, setQuoteResponse] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // **State for Add Fiat Account Form**
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('SEPA'); // Default to SEPA since it's the only option
  const [fiatAccountFields, setFiatAccountFields] = useState({
    accountNumber: '',
    recipientFullAddress: '',
    recipientAddressCountry: '',
  });
  const [fiatResponse, setFiatResponse] = useState(null);
  const [fiatError, setFiatError] = useState(null);
  const [isFiatLoading, setIsFiatLoading] = useState(false);

  // **Handle Changes for Quotes Form**
  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteData((prev) => ({ ...prev, [name]: value }));
  };

  // **Handle Submission for Quotes Form**
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteError(null);
    setQuoteResponse(null);
    setIsQuoteLoading(true);

    // Basic validation
    if (!quoteData.fromCurrency || !quoteData.toCurrency || !quoteData.paymentMethodType) {
      setQuoteError('fromCurrency, toCurrency, and paymentMethodType are required.');
      setIsQuoteLoading(false);
      return;
    }

    // Ensure that exactly one of fromAmount or toAmount is provided
    if ((quoteData.fromAmount && quoteData.toAmount) || (!quoteData.fromAmount && !quoteData.toAmount)) {
      setQuoteError('Provide either fromAmount or toAmount, but not both.');
      setIsQuoteLoading(false);
      return;
    }

    // If metadata is provided, ensure it's valid JSON
    let parsedMetadata = null;
    if (quoteData.metadata) {
      try {
        parsedMetadata = JSON.parse(quoteData.metadata);
      } catch (err) {
        setQuoteError('Metadata must be a valid JSON string.');
        setIsQuoteLoading(false);
        return;
      }
    }

    // Prepare the request payload
    const payload = {
      chain: quoteData.chain || undefined, // Optional
      fromAmount: quoteData.fromAmount || undefined, // Optional
      fromCurrency: quoteData.fromCurrency,
      paymentMethodType: quoteData.paymentMethodType,
      toCurrency: quoteData.toCurrency,
      toAmount: quoteData.toAmount || undefined, // Optional
      ...(parsedMetadata && { metadata: parsedMetadata }), // Optional
    };

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // **Log the response for debugging**
      console.log('Quotes API Response Status:', res.status);
      const data = await res.json();
      console.log('Quotes API Response Body:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create quote.');
      }

      setQuoteResponse(data);
      // Reset Quotes Form
      setQuoteData({
        chain: '',
        fromAmount: '',
        fromCurrency: '',
        paymentMethodType: '',
        toCurrency: '',
        toAmount: '',
        metadata: '',
      });
    } catch (err) {
      setQuoteError(err.message);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // **Handle Changes for Add Fiat Account Form**
  const handleFiatChange = (e) => {
    const { name, value } = e.target;
    setFiatAccountFields((prev) => ({ ...prev, [name]: value }));
  };

  // **Handle Submission for Add Fiat Account Form**
  const handleFiatSubmit = async (e) => {
    e.preventDefault();
    setFiatError(null);
    setFiatResponse(null);
    setIsFiatLoading(true);

    // Basic validation
    if (!customerId || !type) {
      setFiatError('Please fill in all required fields.');
      setIsFiatLoading(false);
      return;
    }

    // Ensure all required fiatAccountFields are filled
    for (let [key, value] of Object.entries(fiatAccountFields)) {
      if (!value) {
        const fieldName = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        setFiatError(`Please fill in the "${fieldName}" field.`);
        setIsFiatLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/offramp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, type, fiatAccountFields }),
      });

      // **Log the response for debugging**
      console.log('Offramp API Response Status:', res.status);
      const data = await res.json();
      console.log('Offramp API Response Body:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add fiat account.');
      }

      setFiatResponse(data);
      // Reset Add Fiat Account Form
      setCustomerId('');
      setFiatAccountFields({
        accountNumber: '',
        recipientFullAddress: '',
        recipientAddressCountry: '',
      });
    } catch (err) {
      setFiatError(err.message);
    } finally {
      setIsFiatLoading(false);
    }
  };

  return (
    <div className="offramp-container">
      <h2>Quotes</h2>
      {/* Quotes Form */}
      <form onSubmit={handleQuoteSubmit} className="quote-form">
        {/* Chain (Optional) */}
        <label htmlFor="chain">Chain (Optional):</label>
        <select
          id="chain"
          name="chain"
          value={quoteData.chain}
          onChange={handleQuoteChange}
          className="quote-input"
        >
          <option value="">Select Chain</option>
          <option value="ETH">ETH</option>
          <option value="SOL">SOL</option>
          <option value="BASE">BASE</option>
          {/* Add other chains as needed */}
        </select>

        {/* From Currency */}
        <label htmlFor="fromCurrency">From Currency:</label>
        <input
          type="text"
          id="fromCurrency"
          name="fromCurrency"
          value={quoteData.fromCurrency}
          onChange={handleQuoteChange}
          placeholder="e.g., BRL, USDC_SOL, USDC"
          required
          className="quote-input"
        />

        {/* To Currency */}
        <label htmlFor="toCurrency">To Currency:</label>
        <input
          type="text"
          id="toCurrency"
          name="toCurrency"
          value={quoteData.toCurrency}
          onChange={handleQuoteChange}
          placeholder="e.g., USDC, EUR, BRL"
          required
          className="quote-input"
        />

        {/* Payment Method Type */}
        <label htmlFor="paymentMethodType">Payment Method Type:</label>
        <select
          id="paymentMethodType"
          name="paymentMethodType"
          value={quoteData.paymentMethodType}
          onChange={handleQuoteChange}
          required
          className="quote-input"
        >
          <option value="">Select Payment Method</option>
          <option value="PIX">PIX</option>
          <option value="SEPA">SEPA</option>
          <option value="SPEI">SPEI</option>
          {/* Add other payment methods as needed */}
        </select>

        {/* From Amount */}
        <label htmlFor="fromAmount">From Amount (Optional):</label>
        <input
          type="number"
          id="fromAmount"
          name="fromAmount"
          value={quoteData.fromAmount}
          onChange={handleQuoteChange}
          placeholder="Enter From Amount"
          min="0"
          step="0.01"
          className="quote-input"
        />

        {/* To Amount */}
        <label htmlFor="toAmount">To Amount (Optional):</label>
        <input
          type="number"
          id="toAmount"
          name="toAmount"
          value={quoteData.toAmount}
          onChange={handleQuoteChange}
          placeholder="Enter To Amount"
          min="0"
          step="0.01"
          className="quote-input"
        />

        {/* Metadata (Optional) */}
        <label htmlFor="metadata">Metadata (Optional):</label>
        <textarea
          id="metadata"
          name="metadata"
          value={quoteData.metadata}
          onChange={handleQuoteChange}
          placeholder='e.g., {"developerId": "uuid", "markupFeeRate": "0.01"}'
          className="quote-input"
        />

        {/* Submit Button */}
        <button type="submit" className="quote-button" disabled={isQuoteLoading}>
          {isQuoteLoading ? 'Creating Quote...' : 'Create Quote'}
        </button>
      </form>

      {/* Display Quote Error */}
      {quoteError && (
        <div className="response-box error-box">
          <button className="close-button" onClick={() => setQuoteError(null)}>
            ×
          </button>
          <h3>Error</h3>
          <p>{quoteError}</p>
        </div>
      )}

      {/* Display Quote Response */}
      {quoteResponse && (
        <div className="response-box">
          <button className="close-button" onClick={() => setQuoteResponse(null)}>
            ×
          </button>
          <h3>Quote Created Successfully:</h3>
          <p><strong>Quote ID:</strong> {quoteResponse.quoteId}</p>
          <p><strong>From Currency:</strong> {quoteResponse.fromCurrency}</p>
          <p><strong>To Currency:</strong> {quoteResponse.toCurrency}</p>
          <p><strong>From Amount:</strong> {quoteResponse.fromAmount}</p>
          <p><strong>To Amount:</strong> {quoteResponse.toAmount}</p>
          <p><strong>Payment Method Type:</strong> {quoteResponse.paymentMethodType}</p>
          <p><strong>Rate:</strong> {quoteResponse.rate}</p>
          {quoteResponse.fees && (
            <div>
              <strong>Fees:</strong>
              <ul>
                {quoteResponse.fees.map((fee, index) => (
                  <li key={index}>{fee.type}: {fee.amount} {fee.currency}</li>
                ))}
              </ul>
            </div>
          )}
          {quoteResponse.chain && <p><strong>Chain:</strong> {quoteResponse.chain}</p>}
          <p><strong>Expiration:</strong> {new Date(quoteResponse.expiration).toLocaleString()}</p>
          {quoteResponse.metadata && (
            <div>
              <strong>Metadata:</strong>
              <pre>{JSON.stringify(quoteResponse.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <hr />

      <h2>Add Fiat Account</h2>
      {/* Add Fiat Account Form */}
      <form onSubmit={handleFiatSubmit} className="offramp-form">
        {/* Customer ID */}
        <label htmlFor="customerId">Customer ID:</label>
        <input
          type="text"
          id="customerId"
          name="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter Customer ID"
          required
          className="offramp-input"
        />

        {/* Fiat Account Type - Only SEPA */}
        <label htmlFor="type">Fiat Account Type:</label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="offramp-input"
          disabled
        >
          <option value="SEPA">SEPA</option>
        </select>

        {/* SEPA Fiat Account Fields */}
        <div className="fiat-field">
          <label htmlFor="accountNumber">Account Number:</label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={fiatAccountFields.accountNumber}
            onChange={handleFiatChange}
            placeholder="Enter Account Number"
            required
            className="offramp-input"
          />
        </div>

        <div className="fiat-field">
          <label htmlFor="recipientFullAddress">Recipient Full Address:</label>
          <input
            type="text"
            id="recipientFullAddress"
            name="recipientFullAddress"
            value={fiatAccountFields.recipientFullAddress}
            onChange={handleFiatChange}
            placeholder="Enter Recipient Full Address"
            required
            className="offramp-input"
          />
        </div>

        <div className="fiat-field">
          <label htmlFor="recipientAddressCountry">Recipient Address Country:</label>
          <input
            type="text"
            id="recipientAddressCountry"
            name="recipientAddressCountry"
            value={fiatAccountFields.recipientAddressCountry}
            onChange={handleFiatChange}
            placeholder="Enter Recipient Address Country (e.g., US)"
            required
            className="offramp-input"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="offramp-button" disabled={isFiatLoading}>
          {isFiatLoading ? 'Adding...' : 'Add Fiat Account'}
        </button>
      </form>

      {/* Display Fiat Account Error */}
      {fiatError && (
        <div className="response-box error-box">
          <button className="close-button" onClick={() => setFiatError(null)}>
            ×
          </button>
          <h3>Error</h3>
          <p>{fiatError}</p>
        </div>
      )}

      {/* Display Fiat Account Response */}
      {fiatResponse && (
        <div className="response-box">
          <button className="close-button" onClick={() => setFiatResponse(null)}>
            ×
          </button>
          <h3>Fiat Account Added Successfully:</h3>
          <p><strong>Fiat Account ID:</strong> {fiatResponse.fiatAccountId}</p>
          <p><strong>Created At:</strong> {new Date(fiatResponse.createdAt).toLocaleString()}</p>
          <p><strong>Bank Name:</strong> {fiatResponse.bankName}</p>
        </div>
      )}
    </div>
  );
};

export default Offramp;
