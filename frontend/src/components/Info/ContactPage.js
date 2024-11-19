'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerChildren = {
  animate: {
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.2
    }
  }
};

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
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white overflow-hidden">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.8 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Calcoy
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
              <Link href="/features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
              <Link href="/contact" className="text-indigo-600 font-medium">Contact</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                Log in
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-32">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            We value your input! Whether you have questions, suggestions, or just want to share your Calcoy experience, we're here to listen.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Form Section */}
      <section className="relative z-10 bg-gradient-to-b from-white via-indigo-50/30 to-white py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap -mx-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 px-4 mb-8 lg:mb-0"
            >
              <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    required 
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    required 
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    required 
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows="4" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 flex items-center justify-center group"
                >
                  Send Message
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 px-4"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-12 shadow-xl h-full">
                <h3 className="text-3xl font-bold mb-8">Connect With Us</h3>
                <div className="space-y-8">
                  <ContactInfo icon={<Mail className="w-6 h-6" />} text="placeholderemail" />
                  <ContactInfo icon={<Phone className="w-6 h-6" />} text="+placeholderphonenumber" />
                </div>
                <p className="mt-12 text-lg text-white/90">
                  We strive to respond to all inquiries within 24 hours. Your feedback helps us improve Timewise for everyone!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactInfo = ({ icon, text }) => (
  <div className="flex items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
    <div className="mr-4">{icon}</div>
    <p className="text-lg">{text}</p>
  </div>
);

export default ContactPage;