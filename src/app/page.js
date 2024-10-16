// src/app/page.js
'use client';

import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1>Welcome to WhitelabelRamps</h1>
      <div className="homepage-options">
        <Link href="/offramp">
          <button className="home-button">Offramp</button>
        </Link>
        <Link href="/onramp">
          <button className="home-button">Onramp</button>
        </Link>
        <Link href="/customers/kyc">
          <button className="home-button">Customers/KYC</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
