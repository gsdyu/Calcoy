'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Palette, ChevronRight, ArrowRight } from 'lucide-react';
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

const LandingPage = () => {
  const router = useRouter();

  const handleDemoRequest = () => {
    router.push('/calendar');
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
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
      <section className="relative z-10 min-h-[80vh] flex items-center">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1, ease: "easeOut" }
                }
              }}
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Master Your Time,
              <br />
              Amplify Your Life
            </motion.h1>
            <motion.p 
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1, ease: "easeOut" }
                }
              }}
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              Experience the future of scheduling with AI-powered coordination, seamless team sync, and intelligent time optimization.
            </motion.p>
            <motion.div 
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1, ease: "easeOut" }
                }
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                href="/auth/signup" 
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 flex items-center justify-center group"
              >
                Start for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={handleDemoRequest}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center group"
              >
                Demo
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 bg-gradient-to-b from-white via-indigo-50/30 to-white py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  delayChildren: 0.2,
                  staggerChildren: 0.3
                }
              }
            }}
            className="max-w-2xl mx-auto text-center mb-20"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-4xl font-bold mb-6"
            >
              Why Teams Choose Calcoy
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-gray-600"
            >
              Powerful features that transform how you manage time and collaborate with your team.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              animate: {
                transition: {
                  delayChildren: 0.3,
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<Calendar className="w-8 h-8" />}
              title="Smart Scheduling"
              description="AI-powered scheduling that learns your preferences and optimizes your calendar automatically."
              gradient="from-blue-500 to-indigo-500"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Team Sync"
              description="Seamlessly coordinate with your team across time zones with intelligent availability matching."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard 
              icon={<Palette className="w-8 h-8" />}
              title="Customization"
              description="Personalize your workspace with custom themes, layouts, and workflows that match how you like to work."
              gradient="from-orange-500 to-red-500"
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
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Time?</h2>
            <p className="text-white/90 text-xl mb-8">
              Join thousands of professionals already mastering their schedule with Timewise.
            </p>
            <Link 
              href="/auth/signup" 
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-medium hover:bg-indigo-50 transition-all transform hover:-translate-y-0.5"
            >
              Get Started Now
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
    className="group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white mb-6`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

export default LandingPage;