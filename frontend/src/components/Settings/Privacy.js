"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';

const PrivacyControl = () => {
  const [privacyOptions] = useState([
    { id: 'public', label: 'Public: All friends can see event details', description: 'Details of your events are visible to all friends.' },
    { id: 'limited', label: 'Limited: Friends see name and time only', description: 'Friends can only view the username and time.' },
    { id: 'private', label: 'Private: Not visible to friends', description: 'Your events are completely hidden from friends.' },
  ]);
  const [selectedOption, setSelectedOption] = useState('public');
  const [userId, setUserId] = useState(null);

  // Fetch current privacy setting from the server
  const fetchPrivacySetting = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/privacy-setting', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      setSelectedOption(data.privacy || 'public');
      setUserId(data.userId); // Set user ID from the response
    } catch (error) {
      console.error('Error fetching privacy setting:', error);
      alert('Failed to fetch privacy settings. Please try again.');
    }
  };

  // Save updated privacy setting to the server
  const savePrivacySetting = async (newPrivacy) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/privacy-setting', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, privacy: newPrivacy }), // Include userId and new privacy setting
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText} (${response.status})`);
      }

      setSelectedOption(newPrivacy);
      alert('Privacy setting updated successfully!');
    } catch (error) {
      console.error('Error saving privacy setting:', error);
      alert('Failed to update privacy settings. Please try again.');
    }
  };

  useEffect(() => {
    fetchPrivacySetting();
  }, []);

  const handlePrivacyChange = (option) => {
    savePrivacySetting(option.id);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900">Privacy Settings</h1>

      {/* Privacy Options Section */}
      <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Privacy Options</h2>
        <div className="space-y-4">
          {privacyOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedOption === option.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handlePrivacyChange(option)}
            >
              <h3 className="text-lg font-medium text-gray-900">{option.label}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
              {selectedOption === option.id && (
                <div className="mt-2 text-blue-500">
                  <Check size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyControl;
