import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Shield, Edit2, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DefaultProfileIcon = () => (
  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const Profile = () => {
  const { darkMode } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Add error state

  useEffect(() => {
    // Fetch user data from backend
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setDisplayName(data.username);
        setEmail(data.email);
        setProfileImage(data.profile_image);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    setIsEditingName(false);
	if (displayName.length>32)
    console.log(displayName.length)	

    const token = localStorage.getItem('token');
    if (!token) return;
	

    try {
	  // Checks that desired username fits within the schema range
	  if (displayName.length>32) throw new Error('Username is too long. Between 1-32 characters please.');
	  if (displayName.length==0) throw new Error('Username cannot be empty');

      const response = await fetch('http://localhost:5000/profile/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: displayName }),
      });

      if (!response.ok) {
		//console.log(response)
		if (response.status == 409) throw new Error(`Username ${displayName} is already taken`);
        throw new Error('An error occurred on the server. Try again later.');
      }
      alert('Username updated successfully!');
    } catch (error) {
	  const err_msg = `Error updating username: ${error.message}`
      console.error(err_msg);
		alert(err_msg);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
	  //FormData uses encoding type "multipart/form-data"
      const formData = new FormData();
      formData.append('profile_image', file);

      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/profile/picture', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,

        });
        const data = await response.json();
        setProfileImage(data.profile_image);
        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Error updating profile picture.');
      }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Display error message if any
  }

  return (
    <div className={`flex-1 p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="flex items-center mb-8">
        <div className="relative w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-6">
          {profileImage ? (
            <img src={`http://localhost:5000/${profileImage}`} alt="Profile" className="w-full h-full object-cover" />
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
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{email}</p>
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
