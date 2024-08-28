'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Zap, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">Timewise</Link>
        <div className="space-x-4">
          <Link href="/auth/about" className="text-indigo-600 hover:text-indigo-800">About</Link>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Features</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-indigo-600 font-medium">Log in</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-8 text-center">About Timewise</h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          We created Timewise because we've experienced the frustration of using calendar apps that were either too simple or had a steep learning curve. Our mission is to provide a perfect balance of simplicity and powerful features.
        </p>
      </section>

      {/* Our Story Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StoryCard 
              icon={<Clock className="w-12 h-12 text-indigo-600" />}
              title="The Problem"
              description="We found existing calendar apps either lacked features or were too complex to use efficiently."
            />
            <StoryCard 
              icon={<Zap className="w-12 h-12 text-indigo-600" />}
              title="The Solution"
              description="We built Timewise to be intuitive yet powerful, striking the perfect balance for users of all levels."
            />
            <StoryCard 
              icon={<Users className="w-12 h-12 text-indigo-600" />}
              title="Our Promise"
              description="We're committed to continuous improvement, always listening to our users to make Timewise even better."
            />
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            To empower individuals and teams with a scheduling tool that's both easy to use and feature-rich, helping everyone make the most of their time.
          </p>
        </div>
      </section>

        {/* Team Section */}
        <section className="py-20">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="flex flex-wrap justify-center">
            <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src="/kev.png" alt="Kev" className="w-full h-64 object-cover object-center" />
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Big D</h3>
                    <p className="text-gray-600 mb-4">Ceo and Full Stack Developer</p>
                    <p className="text-gray-700">Taekwondo master, Kenstyle Older Brother, Chipotle Fiend, Monster Muncher, Caniac</p>
                </div>
                </div>
            </div>
            {/* Add more team member cards here */}
            </div>
        </div>
        </section>

      {/* CTA Section */}
      <section className="bg-indigo-100 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Scheduling?</h2>
          <p className="text-xl mb-8">Experience the perfect balance of simplicity and power with Timewise.</p>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition duration-300">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

const StoryCard = ({ icon, title, description }) => (
  <div className="text-center p-6 bg-indigo-50 rounded-lg shadow-md hover:shadow-lg transition duration-300">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default AboutPage;