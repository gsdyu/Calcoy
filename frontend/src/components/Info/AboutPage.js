'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Zap, Users, Instagram, Linkedin, Globe, ArrowRight } from 'lucide-react';
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

const AboutPage = () => {
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
              <Link href="/about" className="text-indigo-600 font-medium">About</Link>
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
            About Timewise
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            We created Timewise because we've experienced the frustration of using calendar apps that were either too simple or had a steep learning curve. Our mission is to provide a perfect balance of simplicity and powerful features.
          </motion.p>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="relative z-10 bg-gradient-to-b from-white via-indigo-50/30 to-white py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="max-w-2xl mx-auto text-center mb-20"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-4xl font-bold mb-6 text-gray-900"
            >
              Our Story
            </motion.h2>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <StoryCard 
              icon={<Clock className="w-8 h-8" />}
              title="The Problem"
              description="We found existing calendar apps either lacked features or were too complex to use efficiently."
              gradient="from-blue-500 to-indigo-500"
            />
            <StoryCard 
              icon={<Zap className="w-8 h-8" />}
              title="The Solution"
              description="We built Timewise to be intuitive yet powerful, striking the perfect balance for users of all levels."
              gradient="from-purple-500 to-pink-500"
            />
            <StoryCard 
              icon={<Users className="w-8 h-8" />}
              title="Our Promise"
              description="We're committed to continuous improvement, always listening to our users to make Timewise even better."
              gradient="from-orange-500 to-red-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative z-10 py-32 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-white/90 text-xl leading-relaxed">
              To empower individuals and teams with a scheduling tool that's both easy to use and feature-rich, helping everyone make the most of their time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-32 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="max-w-2xl mx-auto text-center mb-20"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-4xl font-bold mb-6 text-gray-900"
            >
              Meet Our Team
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="flex flex-wrap justify-center"
          >
            <TeamMemberCard 
              name="Big D"
              role="CEO"
              description="Taekwondo master, Kenstyle Older Brother, Chipotle Fiend, Monster Muncher, Caniac"
              image="/kevh.png"
              socials={{
                instagram: "Placeholder",
                linkedin: "placeholder",
                website: "placeholder"
              }}
            />
              <TeamMemberCard 
              name="Nam Ton"
              role="Full-Stack | UI designer | Project Lead"
              description="Creative visionary with a passion for user experience and interface design. Minimal design advocate."
              image="/nam.png"
              imagePosition="object-center"
              socials={{
                instagram: "",
                linkedin: "",
                website: ""
              }}
            />
              <TeamMemberCard 
              name="Mina"
              role="Backend Devleoper"
              description="Backend developer. Immortal Valorant player. Roblox enthusiast."
              image="/mina.png"
              imagePosition="object-center"
              socials={{
                instagram: "",
                linkedin: "",
                website: ""
              }}
              
            />
              <TeamMemberCard 
              name="Toan"
              role="Full-Stack & AI Developer | UI Designer"
              description="loves his gf"
              image="/toan.png"
              imagePosition="object-[50%_40%]"
              socials={{
                instagram: "",
                linkedin: "",
                website: ""
              }}
              
            />
              <TeamMemberCard 
              name="Justin"
              role="Backend & AI Developer | DevOps"
              description="Powered by coffee, cheese, and In-N-Out Cheese-Burgers. ☕️ 🧀 🍔."
              image="/Justin.png"
              imagePosition="object-[50%_40%]"
              socials={{
                instagram: "",
                linkedin: "",
                website: ""
              }}
              
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
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Scheduling?</h2>
            <p className="text-white/90 text-xl mb-8">
              Experience the perfect balance of simplicity and power with Timewise.
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

const StoryCard = ({ icon, title, description, gradient }) => (
  <motion.div 
    variants={fadeIn}
    className="group p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white mb-6`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </motion.div>
);

const TeamMemberCard = ({ name, role, description, image, socials, imagePosition = "object-center" }) => (
  <motion.div 
    variants={fadeIn}
    className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8"
  >
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <img 
        src={image} 
        alt={name} 
        className={`w-full h-64 object-cover ${imagePosition}`} 
      />
      <div className="absolute top-0 right-0 p-4 flex space-x-2">
        {socials.instagram && (
          <SocialIcon Icon={Instagram} href={socials.instagram} />
        )}
        {socials.linkedin && (
          <SocialIcon Icon={Linkedin} href={socials.linkedin} />
        )}
        {socials.website && (
          <SocialIcon Icon={Globe} href={socials.website} />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-gray-600 mb-3">{role}</p>
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </div>
  </motion.div>
);

const SocialIcon = ({ Icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-indigo-600 transition-all duration-300 hover:-translate-y-1 shadow-lg"
  >
    <Icon size={20} />
  </a>
);

export default AboutPage;