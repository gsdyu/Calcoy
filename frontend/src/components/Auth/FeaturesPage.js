'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Sliders, Eye, Moon, Sun } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">Timewise</Link>
        <div className="space-x-4">
          <Link href="/auth/about" className="text-gray-600 hover:text-indigo-600">About</Link>
          <Link href="/auth/features" className="text-indigo-600 hover:text-indigo-800">Features</Link>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-indigo-600 font-medium">Log in</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-8 text-center">Timewise Features</h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Discover the powerful features that make Timewise the perfect balance of simplicity and functionality for all your scheduling needs.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FeatureCard 
              icon={<Calendar className="w-12 h-12 text-indigo-600" />}
              title="Versatile Calendar Views"
              description="Switch seamlessly between day, week, and month views. Our intuitive interface allows for easy navigation and event management across all time frames."
            />
            <FeatureCard 
              icon={<Users className="w-12 h-12 text-indigo-600" />}
              title="Collaborative Scheduling"
              description="Share calendars, schedule meetings, and coordinate events with ease. Perfect for teams and group planning."
            />
            <FeatureCard 
              icon={<Sliders className="w-12 h-12 text-indigo-600" />}
              title="Customizable Interface"
              description="Tailor your calendar layout to fit your unique planning style. Personalize your experience with customizable views and settings."
            />
            <FeatureCard 
              icon={<Eye className="w-12 h-12 text-indigo-600" />}
              title="Smart Mini-Calendar"
              description="Quick overview and navigation with our interactive mini-calendar. Easily jump to specific dates and get a bird's-eye view of your schedule."
            />
            <FeatureCard 
              icon={<Moon className="w-12 h-12 text-indigo-600" />}
              title="Dark Mode Support"
              description="Reduce eye strain with our sleek dark mode. Automatically adjusts to your system preferences or set it manually for your comfort."
            />
            <FeatureCard 
              icon={<Sun className="w-12 h-12 text-indigo-600" />}
              title="Intuitive Event Management"
              description="Effortlessly add, edit, and organize your events. Our user-friendly interface makes managing your schedule a breeze."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Timewise?</h2>
          <p className="text-xl mb-8">Join thousands of users who have transformed their scheduling experience.</p>
          <Link href="/auth/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-100 transition duration-300">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-indigo-50 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold ml-4">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default FeaturesPage;