// src/app/offramp/page.js

'use client';

import React, { useState, useEffect } from 'react';

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

  // State for Offramp Transaction Form
  const [transactionData, setTransactionData] = useState({
    customerId: '',
    quoteId: '',
    fromCurrency: '',
    toCurrency: '',
    amount: '',
    fiatAccountId: '',
    chain: ''
  });
  const [transactionResponse, setTransactionResponse] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);

  // Handle Changes for Transaction Form
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submission for Offramp Transaction Form
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setTransactionError(null);
    setTransactionResponse(null);
    setIsTransactionLoading(true);

    const { customerId, quoteId, fromCurrency, toCurrency, amount, fiatAccountId, chain } = transactionData;

    // Basic validation
    if (!customerId || !quoteId || !fromCurrency || !toCurrency || !amount || !fiatAccountId) {
      setTransactionError('customerId, quoteId, fromCurrency, toCurrency, amount, and fiatAccountId are required.');
      setIsTransactionLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/transaction', { // Call the specific endpoint for the transaction
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          quoteId,
          fromCurrency,
          toCurrency,
          amount,
          fiatAccountId,
          chain // Optional, but included if provided
        })
      });

      // Check response
      if (!res.ok) {
        const errorData = await res.text(); // Log response as text
        throw new Error(errorData || 'Failed to initiate offramp transaction.');
      }

      const data = await res.json(); // Parsing JSON only if the response is OK
      setTransactionResponse(data);

      // Reset the transaction data
      setTransactionData({
        customerId: '',
        quoteId: '',
        fromCurrency: '',
        toCurrency: '',
        amount: '',
        fiatAccountId: '',
        chain: ''
      });

    } catch (err) {
      setTransactionError(err.message); // Set transaction error message
    } finally {
      setIsTransactionLoading(false); // Reset loading state
    }
  };

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

      setTransactionData((prev) => ({
        ...prev,
        quoteId: data.quoteId, // Extract quoteId from response
        fromCurrency: data.fromCurrency,
        toCurrency: data.toCurrency,
        amount: data.fromAmount,
      }));

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

  const fetchCustomerFiatAccounts = async () => {
    if (!customerId) {
      setError('Customer ID cannot be empty.');
      return; // Prevent call if no customer ID is provided
    }

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const res = await fetch(`/api/offramp-data/${customerId}/fiatAccounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.text(); // Read the response as text
        console.error('Error data:', errorData);
        throw new Error('Failed to fetch fiat accounts');
      }

      const data = await res.json();
      setFiatAccounts(data.fiatAccounts || []); // Store the fetched accounts
    } catch (err) {
      setError(err.message); // Handle error
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(20); // Default page size
  const [pageOffset, setPageOffset] = useState(0); // Default to the first page
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOfframpTransactions = async () => {
    setError(null);
    setLoading(true);

    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }), // Only include if startDate is set
      ...(endDate && { endDate }), // Only include if endDate is set
      pageSize,
      pageOffset,
    }).toString();

    try {
      const res = await fetch(`/api/offramp-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include any additional headers if required: 'api-key': 'Your-API-Key',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }

      const data = await res.json();
      setTransactions(data.transactions || []); // Assuming data contains transactions
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <h2>Offramp Transaction</h2>
      {/* Offramp Transaction Form */}
      <form onSubmit={handleTransactionSubmit} className="offramp-form">

        <div className='transaction-field'>
          <label htmlFor="customerId">Customer ID:</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={transactionData.customerId}
            onChange={handleTransactionChange}
            placeholder="Enter Customer ID"
            required
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="quoteId">Quote ID:</label>
          <input
            type="text"
            id="quoteId"
            name="quoteId"
            value={transactionData.quoteId}
            onChange={handleTransactionChange}
            placeholder="Enter Quote ID"
            required
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="fromCurrency">From Currency:</label>
          <input
            type="text"
            id="fromCurrency"
            name="fromCurrency"
            value={transactionData.fromCurrency}
            onChange={handleTransactionChange}
            placeholder="e.g., USDC, ETH"
            required
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="toCurrency">To Currency:</label>
          <input
            type="text"
            id="toCurrency"
            name="toCurrency"
            value={transactionData.toCurrency}
            onChange={handleTransactionChange}
            placeholder="e.g., USD, BRL, EUR"
            required
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={transactionData.amount}
            onChange={handleTransactionChange}
            placeholder="Enter Amount"
            required
            min="0"
            step="0.01"
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="fiatAccountId">Fiat Account ID:</label>
          <input
            type="text"
            id="fiatAccountId"
            name="fiatAccountId"
            value={transactionData.fiatAccountId}
            onChange={handleTransactionChange}
            placeholder="Enter your FIAT Account ID"
            required
            className="offramp-input"
          />
        </div>

        <div className='transaction-field'>
          <label htmlFor="chain">Chain (Optional):</label>
          <input
            type="text"
            id="chain"
            name="chain"
            value={transactionData.chain}
            onChange={handleTransactionChange}
            className="offramp-input"
          />
        </div>

        <button type="submit" className="offramp-button" disabled={isTransactionLoading}>
          {isTransactionLoading ? 'Initiating Transaction...' : 'Initiate Transaction'}
        </button>
      </form>
      {/* Display Transaction Error */}
      {transactionError && (
        <div className="response-box error-box">
          <button className="close-button" onClick={() => setTransactionError(null)}>
            ×
          </button>
          <h3>Error</h3>
          <p>{transactionError}</p>
        </div>
      )}
      {/* Display Transaction Response */}
      {transactionResponse && (
        <div className="response-box">
          <button className="close-button" onClick={() => setTransactionResponse(null)}>
            ×
          </button>
          <h3>Transaction Initiated Successfully:</h3>
          <p><strong>Transaction ID:</strong> {transactionResponse.transactionId}</p>
          <p><strong>From Currency:</strong> {transactionResponse.fromCurrency}</p>
          <p><strong>To Currency:</strong> {transactionResponse.toCurrency}</p>
          <p><strong>From Amount:</strong> {transactionResponse.fromAmount}</p>
          <p><strong>To Amount:</strong> {transactionResponse.toAmount}</p>
          <p><strong>Chain:</strong> {transactionResponse.chain}</p>
          <p><strong>Status:</strong> {transactionResponse.status}</p>
          <p><strong>Deposit Address:</strong> {transactionResponse.depositAddress}</p>
          <p><strong>Expiration:</strong> {new Date(transactionResponse.expiration).toLocaleString()}</p>
        </div>
      )}
      <div>
        <h2>Fetch Offramp Transactions</h2>
        <div className='offramp-form'>
          <label htmlFor="start-date">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="offramp-input"
          />
          <label htmlFor="end-date">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="offramp-input"
          />
          <label htmlFor="page-size">Page Size</label>
          <input
            type="number"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            placeholder="Page Size"
            required
            className="offramp-input"
          />
          <label htmlFor="page-offset">Page Offset</label>
          <input
            type="number"
            value={pageOffset}
            onChange={(e) => setPageOffset(Number(e.target.value))}
            placeholder="Page Offset"
            required
            className="offramp-input"
          />
          <button className='offramp-button' onClick={fetchOfframpTransactions} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Transactions'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {transactions.length > 0 && (
          <div className='response-box'>
            <button className="close-button" onClick={() => setTransactionResponse(null)}>
              ×
            </button>
            <h3>Transactions:</h3>
            <ul>
              {transactions.map((transaction) => (
                <li key={transaction.transactionId}>
                  <p><strong>Transaction ID:</strong> {transaction.transactionId}</p>
                  <p><strong>Customer ID:</strong> {transaction.customerId}</p>
                  <p><strong>Status:</strong> {transaction.status}</p>
                  {/* Add additional fields as necessary */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offramp;

