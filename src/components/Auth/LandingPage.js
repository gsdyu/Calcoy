'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();

  const handleDemoRequest = () => {
    router.push('/calendar');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Timewise</h1>
          <button className="text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer">Products</button>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-blue-600 hover:text-blue-800">Log in</Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign up</Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Schedule. Plan.<br />Succeed.
        </h1>
        <p className="text-xl mb-8">
          Your time, your way. With a little help from AI.
        </p>
        <div className="space-x-4">
          <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Get Timewise free
          </Link>
          <button 
            onClick={handleDemoRequest} 
            className="text-blue-600 hover:text-blue-800 px-6 py-3 text-lg font-semibold"
          >
            Request a demo
          </button>
        </div>
      </main>

      {/* Illustration */}
      <div className="flex justify-center mt-16">
        <svg className="w-96 h-96 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};

export default LandingPage;