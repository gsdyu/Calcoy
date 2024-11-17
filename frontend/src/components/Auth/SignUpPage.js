'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleIcon, MicrosoftIcon, AppleIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';
import { Mail, Lock, User, Check, X } from 'lucide-react';

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
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: 'Enter password'
    });
    const router = useRouter();

    const checkPasswordStrength = (password) => {
        if (!password || password.length === 0) {
            return {
                score: 0,
                label: 'Enter password'
            };
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
        return {
            score,
            label: strengthLabels[score - 1] || 'Weak'
        };
    };

    const getStrengthColor = (score) => {
        const colors = {
            0: 'bg-gray-200',  // Empty state
            1: 'bg-red-500',   // Weak
            2: 'bg-yellow-500', // Fair
            3: 'bg-blue-500',  // Good
            4: 'bg-green-500'  // Strong
        };
        return colors[score] || colors[0];
    };

    const getStrengthTextColor = (score) => {
        const colors = {
            0: 'text-gray-600',  // Empty state
            1: 'text-red-500',   // Weak
            2: 'text-yellow-500', // Fair
            3: 'text-blue-500',  // Good
            4: 'text-green-500'  // Strong
        };
        return colors[score] || colors[0];
    };

    const validateUsername = (username) => {
        const checks = [
            {
                label: '2-32 characters',
                valid: username.length >= 2 && username.length <= 32
            },
            {
                label: 'Lowercase letters, numbers, periods, and underscores only',
                valid: /^[a-z0-9._]+$/.test(username)
            },
            {
                label: 'Cannot start or end with a period or underscore',
                valid: !/^[._]|[._]$/.test(username)
            }
        ];
        return checks;
    };

    const validateForm = () => {
        let errors = {};

        if (formData.username.length < 2 || formData.username.length > 32) {
            errors.username = "Username must be between 2 and 32 characters";
        }
        if (!/^[a-z0-9._]+$/.test(formData.username)) {
            errors.username = "Username can only contain lowercase letters, numbers, periods, and underscores";
        }
        if (/^[._]|[._]$|[.]{2}|[_]{2}/.test(formData.username)) {
            errors.username = "Username cannot start or end with a period or underscore";
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email is invalid";
        }

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
            window.location.href = 'http://localhost:5000/auth/azure';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length === 0) {
            try {
                const response = await fetch('http://localhost:5000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    router.push('/calendar');
                } else {
                    setErrors({ ...formErrors, server: data.error });
                }
            } catch (error) {
                console.error('Signup error:', error);
                setErrors({ ...formErrors, server: 'An unexpected error occurred' });
            }
        } else {
            setErrors(formErrors);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-yellow-100 via-purple-100 to-blue-200">
            {/* Divine Light Effect */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-[800px] h-[800px] bg-white/50 rounded-full blur-3xl"></div>
                    <div className="w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-3xl"></div>
                    <div className="w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-2xl"></div>
                    <div className="w-[300px] h-[300px] bg-purple-200/30 rounded-full blur-xl"></div>
                </div>

                {/* Additional Light Effects */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-yellow-100/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-200/40 to-transparent"></div>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-start gap-6 w-full max-w-6xl px-4">
                {/* Form Section */}
                <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-[400px] relative z-10">
                    <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">Begin Your Journey</h2>
                    <p className="text-gray-600 mb-6 text-center">Where time finds its perfect rhythm</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        {errors.server && <p className="text-sm text-red-600">{errors.server}</p>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                        >
                            Begin Your Journey
                        </button>

                        {/* Social Login Section */}
                        <div className="mt-6 flex items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <a
                                href="http://localhost:5000/auth/google"
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

                        {/* Sign In Link */}
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Requirements Section */}
                <div className="w-72 pt-24">
                    {/* Username Requirements */}
                    <div className="bg-white/80 backdrop-blur-lg p-5 rounded-xl mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Username Requirements</h3>
                        <div className="space-y-4">
                            {validateUsername(formData.username).map((check, index) => (
                                <div key={index} className="pb-3 border-b border-gray-200 last:border-0">
                                    <div className="flex items-start gap-2">
                                        {check.valid ? (
                                            <Check className="w-4 h-4 text-green-500 mt-1" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-500 mt-1" />
                                        )}
                                        <span className={`text-sm ${check.valid ? 'text-green-600' : 'text-red-600'}`}>
                                            {check.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Password Strength */}
                    <div className="bg-white/80 backdrop-blur-lg p-5 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Password Strength</h3>
                        <div className="space-y-4">
                            {/* Segmented Strength Meter */}
                            <div>
                                <div className="flex gap-2 mb-3">
                                    {[1, 2, 3, 4].map((segment) => (
                                        <div
                                            key={segment}
                                            className={`h-1.5 flex-1 rounded-full ${
                                                !formData.password 
                                                    ? 'bg-gray-200' 
                                                    : segment <= passwordStrength.score 
                                                        ? getStrengthColor(passwordStrength.score)
                                                        : 'bg-gray-200'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                                <p className={`text-base ${getStrengthTextColor(passwordStrength.score)}`}>
                                    {passwordStrength.label}
                                </p>
                            </div>

                            {/* Password Requirements */}
                            <div className="space-y-4">
                                {[
                                    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
                                    { label: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
                                    { label: 'One number', valid: /[0-9]/.test(formData.password) },
                                    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(formData.password) }
                                ].map((requirement, index) => (
                                    <div key={index} className="pb-3 border-b border-gray-200 last:border-0">
                                        <div className="flex items-start gap-2">
                                            {requirement.valid ? (
                                                <Check className="w-4 h-4 text-green-500 mt-1" />
                                            ) : (
                                                <X className="w-4 h-4 text-red-500 mt-1" />
                                            )}
                                            <span className={`text-sm ${requirement.valid ? 'text-green-600' : 'text-red-600'}`}>
                                                {requirement.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;