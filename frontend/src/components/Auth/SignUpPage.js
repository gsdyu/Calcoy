'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from '@/components/icons/SocialIcons';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateForm = () => {
    let errors = {};
    
    // Username validation
    if (formData.username.length < 2 || formData.username.length > 32) {
      errors.username = "Username must be between 2 and 32 characters";
    }
    if (!/^[a-z0-9._]+$/.test(formData.username)) {
      errors.username = "Username can only contain lowercase letters, numbers, periods, and underscores";
    }
    if (/^[._]|[._]$|[.]{2}|[_]{2}/.test(formData.username)) {
      errors.username = "Username cannot start or end with a period or underscore, or have two consecutive periods or underscores";
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Password Validation
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await fetch('http://your-python-backend.com/auth/signup', { //Fill in later from our python backend
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          router.push('/auth/login');
        } else {
          const data = await response.json();
          setErrors(data.errors || {});
        }
      } catch (error) {
        console.error('Signup error:', error);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            <p className="mt-1 text-xs text-gray-500">
              2-32 characters, lowercase letters, numbers, periods, and underscores only. 
              Cannot start or end with a period or underscore.
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Or sign up with</p>
          <div className="flex justify-center space-x-4 mt-2">
            <button className="p-2 border rounded-full">
              <GoogleIcon className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full">
              <MicrosoftIcon className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full">
              <AppleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/auth/login" className="text-blue-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;