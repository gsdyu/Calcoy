import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Lock, Bell, Shield, Edit2, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DefaultProfileIcon = () => (
  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const Profile = () => {
  const { darkMode } = useTheme();
  const [displayName, setDisplayName] = useState("John Doe");
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    // Save the new name to backend later
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const ProfileSection = ({ title, description, icon, action }) => (
    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6 mt-6`}>
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold ml-2">{title}</h2>
      </div>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{description}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
        {action}
      </button>
    </div>
  );

  return (
    <div className={`flex-1 p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="flex items-center mb-8">
        <div className="relative w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-6">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <DefaultProfileIcon />
          )}
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white hover:bg-blue-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div>
          {isEditingName ? (
            <div className="flex items-center">
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className={`text-2xl font-semibold bg-transparent border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              />
              <button onClick={handleNameSave} className="ml-2 text-blue-500 hover:text-blue-600">
                <Check size={20} />
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-semibold flex items-center">
              {displayName}
              <button onClick={handleNameEdit} className="ml-2 text-blue-500 hover:text-blue-600">
                <Edit2 size={16} />
              </button>
            </h2>
          )}
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>johndoe@example.com</p>
        </div>
      </div>

      <ProfileSection
        title="Personal Information"
        description="Manage your personal information and how it appears to others."
        icon={<User size={24} className="text-blue-500" />}
        action="Edit Information"
      />

      <ProfileSection
        title="Account Settings"
        description="Update your account settings and preferences."
        icon={<Lock size={24} className="text-green-500" />}
        action="Manage Account"
      />

      <ProfileSection
        title="Privacy Controls"
        description="Control your privacy settings and manage data sharing."
        icon={<Shield size={24} className="text-purple-500" />}
        action="Adjust Privacy"
      />

      <ProfileSection
        title="Notification Preferences"
        description="Customize how and when you receive notifications."
        icon={<Bell size={24} className="text-yellow-500" />}
        action="Set Preferences"
      />
    </div>
  );
};

export default Profile;