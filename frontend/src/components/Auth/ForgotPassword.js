'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, KeyRound, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeSent(true);
        setMessage("We've sent you a reset code. Please check your email.");
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful!');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-12 bg-white/20 rounded-full blur-xl transform -translate-x-1/2"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-12 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-12 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-12 bg-white/20 rounded-full blur-xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md m-4 relative z-10">
        <Link 
          href="/auth/login"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>
        
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          {isCodeSent ? 'Reset Password' : 'Forgot Password?'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isCodeSent 
            ? "Enter the code we sent to your email along with your new password." 
            : "No worries! Enter your email and we'll send you a reset code."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            <span className="text-sm">{message}</span>
          </div>
        )}

        {!isCodeSent ? (
          <form onSubmit={handleRequestResetCode} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}
              `}
            >
              <span className="inline-flex items-center justify-center">
                {isLoading ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reset Code
                  </>
                )}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
                Reset Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="resetCode"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter code"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}
              `}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setIsCodeSent(false)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Need a new code?
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
