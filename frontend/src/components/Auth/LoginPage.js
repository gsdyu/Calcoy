'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';
import { Mail, Lock } from 'lucide-react';

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
      window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`;
    } else if (provider === 'microsoft') {
      window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/azure`; // Redirect to Azure login
    }
  };

  // Handle email/password login with 2FA flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-2fa`, {
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600">
      {/* Decorative waves */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-64">
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/10 rounded-full transform -translate-y-12 scale-150 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/20 rounded-full transform scale-150 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/10 rounded-full transform translate-y-8 scale-150 blur-xl"></div>
        </div>
        
        {/* Sun reflection */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
          <div className="w-24 h-24 bg-yellow-100/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md m-4 relative z-10">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">Welcome Back</h2>
        <p className="text-gray-600 mb-6 text-center">Smart scheduling starts here</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
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
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
              ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}
            `}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <a
            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Google</span>
          </a>
          <button
            onClick={() => handleSocialLogin('microsoft')}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MicrosoftIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Microsoft</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* 2FA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white p-8 rounded-3xl shadow-2xl z-10 w-full max-w-md m-4">
            <h3 className="text-2xl font-bold mb-2 text-gray-800 text-center">
              Two-Factor Authentication
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Please enter the verification code sent to your device
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  name="twoFactorCode"
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter verification code"
                  required
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                >
                  Verify Code
                </button>
                
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
