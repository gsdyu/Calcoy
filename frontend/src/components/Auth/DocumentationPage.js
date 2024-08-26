import React from 'react';
import Link from 'next/link';

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">Timewise</Link>
        <div className="space-x-4">
          <Link href="/auth/about" className="text-gray-600 hover:text-indigo-600">About</Link>
          <Link href="/auth/features" className="text-gray-600 hover:text-indigo-600">Features</Link>
          <Link href="/auth/documentation" className="text-indigo-600 hover:text-indigo-800">Documentation</Link>
          <Link href="/auth/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-indigo-600 font-medium">Log in</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-8 text-center">Timewise Documentation</h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          A comprehensive record of our development process and feature implementations.
        </p>
      </section>

      {/* Documentation Content */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Development Timeline</h2>
          <div className="space-y-8">
            <DocumentationEntry
              date="August 8th - August 13th, 2023"
              author="Nam Ton"
              content={`
                - Designed and implemented the main calendar interface
                - Created a collapsible sidebar with profile picture and task list
                - Implemented light and dark mode functionality
                - Added a mini-calendar to the sidebar
                - Developed day, week, and month views for the calendar
                - Implemented double-click functionality for different calendar views
                - Created landing page, login page, and signup page designs
              `}
            />
            <DocumentationEntry
              date="August 14th - August 20th, 2023"
              author="Nam Ton"
              content={`
                - Added color shading for weekends in the calendar
                - Implemented "go back to today" functionality for mini-calendar
                - Synchronized mini-calendar with the main calendar view
                - Added signifiers for weeks and days in the calendar
                - Migrated the codebase to Next.js framework
                - Developed and migrated landing page, calendar page, signup page, and login page
              `}
            />
            <DocumentationEntry
              date="August 21st - August 25th, 2023"
              author="Nam Ton"
              content={`
                - Set up Next-Auth for authentication
                - Updated login and signup pages with improved user interface
                - Enhanced landing page with features and collaboration highlights
                - Designed and implemented About page
                - Created Features page
                - Developed Contact page
                - Added social media links (Instagram, LinkedIn, personal website) to team member profiles
              `}
            />
          </div>
        </div>
      </section>

      {/* Key Contributions */}
      <section className="bg-indigo-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Contributions by Nam Ton</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-4 max-w-2xl mx-auto">
            <li>Designed and implemented the main calendar interface</li>
            <li>Created responsive and interactive landing page</li>
            <li>Developed user-friendly login and signup pages</li>
            <li>Implemented mini-calendar functionality</li>
            <li>Created day, week, and month calendar views</li>
            <li>Designed and implemented About, Features, and Contact pages</li>
            <li>Migrated the project to Next.js framework</li>
            <li>Integrated Next-Auth for user authentication</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

const DocumentationEntry = ({ date, author, content }) => (
  <div className="border-l-4 border-indigo-500 pl-4">
    <h3 className="text-xl font-semibold mb-2">{date}</h3>
    <p className="text-gray-600 mb-2">Author: {author}</p>
    <pre className="whitespace-pre-wrap text-sm text-gray-700">{content}</pre>
  </div>
);

export default DocumentationPage;