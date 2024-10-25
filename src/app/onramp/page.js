// src/app/onramp/page.js

'use client';

import React, { useState } from 'react';

const Onramp = () => {
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
          <option value="ERC20">ETH</option>
          <option value="BEP20">BSE</option>
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
          placeholder="e.g., EUR"
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
          placeholder="e.g., USDT, ETH"
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
      
          <option value="SEPA">SEPA</option>
       
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

    </div>
  );
};

export default Onramp;
