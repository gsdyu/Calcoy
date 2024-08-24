'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, AppleIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '', 
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setError('Invalid email or password');
      } else {
        router.push('/calendar'); // Redirect to the main app page after successful login
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: '/calendar' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:underline">Forgot password?</a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Log in
          </button>
        </form>
        
        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <div className="mt-6 space-y-4">
          <button onClick={() => handleSocialLogin('apple')} className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <AppleIcon className="w-5 h-5 mr-2" />
            Continue with Apple
          </button>
          <button onClick={() => handleSocialLogin('google')} className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
          <button onClick={() => handleSocialLogin('microsoft')} className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <MicrosoftIcon className="w-5 h-5 mr-2" />
            Continue with Microsoft
          </button>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/auth/signup" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;