'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Sliders, Eye, Moon, Sun, ArrowRight } from 'lucide-react';
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

const FeaturesPage = () => {
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
              Timewise
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
              <Link href="/features" className="text-indigo-600 font-medium">Features</Link>
              <Link href="/documentation" className="text-gray-600 hover:text-indigo-600 transition-colors">Documentation</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</Link>
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
            Powerful Features,
            <br />
            Seamless Experience
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Discover the powerful features that make Timewise the perfect balance of simplicity and functionality for all your scheduling needs.
          </motion.p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 bg-gradient-to-b from-white via-indigo-50/30 to-white py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <FeatureCard 
              icon={<Calendar />}
              title="Versatile Calendar Views"
              description="Switch seamlessly between day, week, and month views. Our intuitive interface allows for easy navigation and event management across all time frames."
              gradient="from-blue-500 to-indigo-500"
            />
            <FeatureCard 
              icon={<Users />}
              title="Collaborative Scheduling"
              description="Share calendars, schedule meetings, and coordinate events with ease. Perfect for teams and group planning."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard 
              icon={<Sliders />}
              title="Customizable Interface"
              description="Tailor your calendar layout to fit your unique planning style. Personalize your experience with customizable views and settings."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard 
              icon={<Eye />}
              title="Smart Mini-Calendar"
              description="Quick overview and navigation with our interactive mini-calendar. Easily jump to specific dates and get a bird's-eye view of your schedule."
              gradient="from-green-500 to-teal-500"
            />
            <FeatureCard 
              icon={<Moon />}
              title="Dark Mode Support"
              description="Reduce eye strain with our sleek dark mode. Automatically adjusts to your system preferences or set it manually for your comfort."
              gradient="from-violet-500 to-purple-500"
            />
            <FeatureCard 
              icon={<Sun />}
              title="Intuitive Event Management"
              description="Effortlessly add, edit, and organize your events. Our user-friendly interface makes managing your schedule a breeze."
              gradient="from-yellow-500 to-orange-500"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience Timewise?</h2>
            <p className="text-white/90 text-xl mb-8">
              Join thousands of users who have transformed their scheduling experience.
            </p>
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-full font-medium hover:bg-indigo-50 transition-all transform hover:-translate-y-0.5 group"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      }
    }}
    className="group p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white mb-6`}>
      {React.cloneElement(icon, { className: "w-8 h-8" })}
    </div>
    <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </motion.div>
);

export default FeaturesPage;