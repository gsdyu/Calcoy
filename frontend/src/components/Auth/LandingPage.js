'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Sliders, Bell } from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  const handleDemoRequest = () => {
    router.push('/calendar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">Timewise</Link>
        <div className="space-x-4">
          <Link href="/auth/about" className="text-gray-600 hover:text-indigo-600">About</Link>
          <Link href="/auth/features" className="text-gray-600 hover:text-indigo-600">Features</Link>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-indigo-600 font-medium">Log in</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 flex items-center justify-between">
        <div className="w-1/2">
          <h1 className="text-6xl font-bold mb-6">
           Collaborate Seamlessly,<br />
           Schedule Effortlessly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Timewise brings collaborative scheduling and customizable planning to your fingertips. Sync your life, share your time.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium text-lg">
              Get Timewise free
            </Link>
            <button 
              onClick={handleDemoRequest}
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-medium text-lg"
            >
              Request a demo
            </button>
          </div>
        </div>
        <div className="w-1/2 relative">
          {/* Placeholder for calendar graphic */}
          <div className="w-full h-96 bg-indigo-200 rounded-lg shadow-2xl transform rotate-6"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-400 rounded-full -mb-10 -mr-10 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Timewise?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Users className="w-12 h-12 text-indigo-600" />}
              title="Seamless Collaboration"
              description="Share calendars, schedule meetings, and coordinate events with ease."
            />
            <FeatureCard 
              icon={<Sliders className="w-12 h-12 text-indigo-600" />}
              title="Customizable Views"
              description="Tailor your calendar layout to fit your unique planning style."
            />
            <FeatureCard 
              icon={<Bell className="w-12 h-12 text-indigo-600" />}
              title="Smart Reminders"
              description="Never miss an important date with AI-powered notifications."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Master Your Time?</h2>
          <p className="text-xl mb-8">Join thousands of productive professionals and teams.</p>
          <Link href="/auth/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-100 transition duration-300">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-6 bg-indigo-50 rounded-lg shadow-md hover:shadow-lg transition duration-300">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default LandingPage;