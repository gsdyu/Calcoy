'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here send the form data to your backend (Deal with when Chong done)
    console.log('Form submitted:', formData);
    // Reset form or show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">Timewise</Link>
        <div className="space-x-4">
          <Link href="/about" className="text-gray-600 hover:text-indigo-600">About</Link>
          <Link href="/features" className="text-gray-600 hover:text-indigo-600">Features</Link>
          <Link href="/documentation" className="text-gray-600 hover:text-indigo-600">Documentation</Link>
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">Contact</Link>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-indigo-600 font-medium">Log in</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-8 text-center">Get in Touch</h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          We value your input! Whether you have questions, suggestions, or just want to share your Timewise experience, we're here to listen.
        </p>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-8 lg:mb-0">
              <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-lg p-8 shadow-md">
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition duration-300">Send Message</button>
              </form>
            </div>
            <div className="w-full lg:w-1/2 px-4">
              <div className="bg-indigo-600 text-white rounded-lg p-8 shadow-md h-full">
                <h3 className="text-2xl font-bold mb-6">Connect With Us</h3>
                <div className="space-y-6">
                  <ContactInfo icon={<Mail />} text="placeholderemail" />
                  <ContactInfo icon={<Phone />} text="+placeholderphonenumber" />
                </div>
                <p className="mt-8">We strive to respond to all inquiries. Your feedback helps us improve Timewise for everyone!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactInfo = ({ icon, text }) => (
  <div className="flex items-center">
    <div className="mr-4">{icon}</div>
    <p>{text}</p>
  </div>
);

export default ContactPage;
