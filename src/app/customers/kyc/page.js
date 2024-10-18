'use client';

import React, { useState } from 'react';

const KycFlow = () => {
  const [countryCode, setCountryCode] = useState('');
  const [kycRequirementsResponse, setKycRequirementsResponse] = useState(null);
  const [customerData, setCustomerData] = useState({
    email: '',
    phoneNumber: '',
    type: 'INDIVIDUAL'
  });
  const [createCustomerResponse, setCreateCustomerResponse] = useState(null);
  const [kycMetadataData, setKycMetadataData] = useState({
    customerId: '',
    kycSubmission: {
      firstName: '',
      lastName: '',
      nationality: '',
      dateOfBirth: '',
      countryOfResidence: ''
    }
  });
  const [addKycMetadataResponse, setAddKycMetadataResponse] = useState(null);
  const [error, setError] = useState(null);
  const [submitKycData, setSubmitKycData] = useState({
    customerId: '',
    submissionId: ''
  });
  const [submitKycResponse, setSubmitKycResponse] = useState(null);
  const [kycWidgetData, setKycWidgetData] = useState({
    customerId: '',
    successUrl: 'https://www.google.com/',
    cancelUrl: 'https://www.valvesoftware.com/'
  });
  const [kycWidgetResponse, setKycWidgetResponse] = useState(null);

  
  const handleGetKycWidgetUrl = async (e) => {
    e.preventDefault();
    setError(null);
    setKycWidgetResponse(null);
  
    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getKycWidgetUrl',
          ...kycWidgetData
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get KYC Widget URL');
      }
  
      setKycWidgetResponse(data);
    } catch (err) {
      console.error('Error in handleGetKycWidgetUrl:', err);
      setError(err.message);
    }
  };

  const handleKycWidgetDataChange = (e) => {
    setKycWidgetData({ ...kycWidgetData, [e.target.name]: e.target.value });
  };
  
  const fetchKycRequirements = async (e) => {
    e.preventDefault();
    setError(null);
    setKycRequirementsResponse(null);

    try {
      const response = await fetch(`/api/kyc?country=${countryCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch KYC requirements');
      }

      setKycRequirementsResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError(null);
    setCreateCustomerResponse(null);

    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createCustomer',
          data: customerData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setCreateCustomerResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddKycMetadata = async (e) => {
    e.preventDefault();
    setError(null);
    setAddKycMetadataResponse(null);

    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addKycMetadata',
          customerId: kycMetadataData.customerId,
          kycSubmission: kycMetadataData.kycSubmission
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add KYC metadata');
      }

      setAddKycMetadataResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCustomerDataChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleKycMetadataChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerId') {
      setKycMetadataData({ ...kycMetadataData, customerId: value });
    } else {
      setKycMetadataData({
        ...kycMetadataData,
        kycSubmission: { ...kycMetadataData.kycSubmission, [name]: value }
      });
    }
  };

  const handleSubmitKycForReview = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitKycResponse(null);

    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitKycForReview',
          customerId: submitKycData.customerId,
          submissionId: submitKycData.submissionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit KYC for review');
      }

      setSubmitKycResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitKycDataChange = (e) => {
    setSubmitKycData({ ...submitKycData, [e.target.name]: e.target.value });
  };

  return (
    <div className="kyc-container">
      <h2>KYC Flow</h2>
      
      <div className="kyc-forms-container">
        <form onSubmit={fetchKycRequirements} className="kyc-form">
          <h3>Get KYC Requirements</h3>
          <input
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="Enter 2-letter country code"
            maxLength={2}
            className="kyc-input"
            required
          />
          <button type="submit" className="kyc-button">Get Requirements</button>
        </form>
  
        <form onSubmit={handleCreateCustomer} className="kyc-form">
          <h3>Create Customer</h3>
          <input
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleCustomerDataChange}
            placeholder="Email"
            className="kyc-input"
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            value={customerData.phoneNumber}
            onChange={handleCustomerDataChange}
            placeholder="Phone Number"
            className="kyc-input"
            required
          />
          <button type="submit" className="kyc-button">Create Customer</button>
        </form>
  
        <form onSubmit={handleAddKycMetadata} className="kyc-form">
          <h3>Add KYC Metadata</h3>
          <input
            type="text"
            name="customerId"
            value={kycMetadataData.customerId}
            onChange={handleKycMetadataChange}
            placeholder="Customer ID"
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="firstName"
            value={kycMetadataData.kycSubmission.firstName}
            onChange={handleKycMetadataChange}
            placeholder="First Name"
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="lastName"
            value={kycMetadataData.kycSubmission.lastName}
            onChange={handleKycMetadataChange}
            placeholder="Last Name"
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="nationality"
            value={kycMetadataData.kycSubmission.nationality}
            onChange={handleKycMetadataChange}
            placeholder="Nationality (2 Letter Code)"
            className="kyc-input"
            required
          />
          <input
            type="date"
            name="dateOfBirth"
            value={kycMetadataData.kycSubmission.dateOfBirth}
            onChange={handleKycMetadataChange}
            placeholder="Date of Birth"
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="countryOfResidence"
            value={kycMetadataData.kycSubmission.countryOfResidence}
            onChange={handleKycMetadataChange}
            placeholder="Country of Residence (2 Letter Code)"
            className="kyc-input"
            required
          />
          <button type="submit" className="kyc-button">Add KYC Metadata</button>
        </form>
  
        <form onSubmit={handleSubmitKycForReview} className="kyc-form">
          <h3>Submit Uploaded KYC Data for Review</h3>
          <input
            type="text"
            name="customerId"
            value={submitKycData.customerId}
            onChange={handleSubmitKycDataChange}
            placeholder="Customer ID"
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="submissionId"
            value={submitKycData.submissionId}
            onChange={handleSubmitKycDataChange}
            placeholder="Submission ID"
            className="kyc-input"
            required
          />
          <button type="submit" className="kyc-button">Submit KYC for Review</button>
        </form>
        <form onSubmit={handleGetKycWidgetUrl} className="kyc-form">
          <h3>Get KYC Widget URL</h3>
          <input
            type="text"
            name="customerId"
            value={kycWidgetData.customerId}
            onChange={handleKycWidgetDataChange}
            placeholder="Customer ID"
            className="kyc-input"
            required
          />
          <input
            type="url"
            name="successUrl"
            value={kycWidgetData.successUrl}
            onChange={handleKycWidgetDataChange}
            placeholder="Success URL"
            className="kyc-input"
            required
          />
          <input
            type="url"
            name="cancelUrl"
            value={kycWidgetData.cancelUrl}
            onChange={handleKycWidgetDataChange}
            placeholder="Cancel URL"
            className="kyc-input"
            required
          />
          <button type="submit" className="kyc-button">Get KYC Widget URL</button>
        </form>

      </div>
  
      <div className="response-boxes">
        {error && (
          <div className="response-box error-box">
            <button className="close-button" onClick={() => setError(null)}>×</button>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
  
        {kycRequirementsResponse && (
          <div className="response-box">
            <button className="close-button" onClick={() => setKycRequirementsResponse(null)}>×</button>
            <h3>KYC Requirements Response:</h3>
            <pre>{JSON.stringify(kycRequirementsResponse, null, 2)}</pre>
          </div>
        )}
  
        {createCustomerResponse && (
          <div className="response-box">
            <button className="close-button" onClick={() => setCreateCustomerResponse(null)}>×</button>
            <h3>Create Customer Response:</h3>
            <pre>{JSON.stringify(createCustomerResponse, null, 2)}</pre>
          </div>
        )}
  
        {addKycMetadataResponse && (
          <div className="response-box">
            <button className="close-button" onClick={() => setAddKycMetadataResponse(null)}>×</button>
            <h3>Add KYC Metadata Response:</h3>
            <pre>{JSON.stringify(addKycMetadataResponse, null, 2)}</pre>
          </div>
        )}
  
        {submitKycResponse && (
          <div className="response-box">
            <button className="close-button" onClick={() => setSubmitKycResponse(null)}>×</button>
            <h3>Submit KYC for Review Response:</h3>
            <pre>{JSON.stringify(submitKycResponse, null, 2)}</pre>
          </div>
        )}
                {kycWidgetResponse && (
          <div className="response-box">
            <button className="close-button" onClick={() => setKycWidgetResponse(null)}>×</button>
            <h3>KYC Widget URL Response:</h3>
            <pre>{JSON.stringify(kycWidgetResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycFlow;