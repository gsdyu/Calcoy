'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  // Handle input changes for form fields
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Handle social logins like Google and Microsoft (Azure)
  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = 'http://localhost:5000/auth/google';
    } else if (provider === 'microsoft') {
      window.location.href = 'http://localhost:5000/auth/azure'; // Redirect to Azure login
    }
  };

  // Handle email/password login with 2FA flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok && data.message === '2FA_REQUIRED') {
        setIsModalOpen(true); // Show 2FA modal if 2FA is required
      } else if (response.ok) {
        router.push('/calendar');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle submission of the 2FA code
  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          twoFactorCode: formData.twoFactorCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        router.push('/calendar');
      } else {
        setError(data.message || 'Invalid or expired 2FA code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('An unexpected error occurred');
    }
  };

  // Toggle visibility of the password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Close the 2FA modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ ...formData, twoFactorCode: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">  Forgot password?</Link>              
         </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Please wait...' : 'Log in'}
          </button>
        </form>

        {/* Social Login and Sign Up Links */}
        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="mt-6 space-y-4">
          <a href="http://localhost:5000/auth/google" className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </a>
          <button onClick={() => handleSocialLogin('microsoft')} className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <MicrosoftIcon className="w-5 h-5 mr-2" />
            Continue with Microsoft
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/auth/signup" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>

      {/* 2FA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-black opacity-50" onClick={closeModal}></div>
          {/* Modal Content */}
          <div className="bg-white p-6 rounded-lg shadow-md z-10 w-80">
            <h3 className="text-xl font-semibold mb-4 text-center">Two-Factor Authentication</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">Enter 2FA Code</label>
                <input
                  type="text"
                  id="twoFactorCode"
                  name="twoFactorCode"
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Verify Code
              </button>
            </form>
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
