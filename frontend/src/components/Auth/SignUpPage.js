'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, AppleIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';
const SignUpPage = () => {
    const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const [errors, setErrors] = useState({});
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (/\s/.test(formData.password)) {
        errors.password = "Password should not contain spaces";
    }
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
    
const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = 'http://localhost:5000/auth/google';
    } else if (provider === 'microsoft') {
      window.location.href = 'http://localhost:5000/auth/azure'; // Redirect to Azure login
    }
  };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();  // Validation function
        
        if (Object.keys(formErrors).length === 0) {  // Proceed if no validation errors
            try {
                const response = await fetch('http://localhost:5000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)  // Send username, email, password
                });
    
				const data = await response.json();

                if (response.ok) {
                    router.push('/calendar');  // Redirect after successful signup
                } else {
                    const data = await response.json();
                    setErrors({ ...formErrors, server: data.error });  // Display server errors
                }
            } catch (error) {
                console.error('Signup error:', error);
                setErrors({ ...formErrors, server: 'An unexpected error occurred' });
            }
        } else {
            setErrors(formErrors);  // Display validation errors
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Create an account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                        <p className="mt-1 text-xs text-gray-500">
                            2-32 characters, lowercase letters, numbers, periods, and underscores only. 
                            Cannot start or end with a period or underscore.
                        </p>
                    </div>
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
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                    {errors.server && <p className="mt-1 text-sm text-red-600">{errors.server}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="mt-6 space-y-4">
                                    <a href="http://localhost:5000/auth/google" className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Sign up with Google
                    </a>
                    <button onClick={() => handleSocialLogin('microsoft')} className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center">
            <MicrosoftIcon className="w-5 h-5 mr-2" />
            Continue with Microsoft
          </button>
    
                </div>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;
