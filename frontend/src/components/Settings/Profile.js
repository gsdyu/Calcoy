import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Shield, Edit2, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ImageEditModal from '@/components/Modals/ImageEditModal';

const DefaultProfileIcon = () => (
  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ProfileImage = ({ 
  profileImage, 
  profileImageX, 
  profileImageY, 
  profileImageScale,
  onImageClick 
}) => {
  const fileInputRef = useRef(null);

  return (
    <div 
      className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
      onClick={() => fileInputRef.current.click()}
    >
      {/* Profile Image or Default Icon */}
      <div className="w-full h-full">
        {profileImage ? (
          <img 
            src={`http://localhost:5000/${profileImage}`} 
            alt="Profile" 
            className="absolute w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-50"
            style={{
              transform: `translate(${profileImageX * 100}%, ${profileImageY * 100}%) scale(${profileImageScale})`,
              transformOrigin: 'center'
            }}
          />
        ) : (
          <div className="group-hover:opacity-50 transition-opacity duration-200">
            <DefaultProfileIcon />
          </div>
        )}
      </div>

      {/* Hover Overlay with Edit Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-30">
        <Edit2 className="text-white" size={24} />
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImageClick} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};

const Profile = () => {
  const { darkMode } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageX, setProfileImageX] = useState(0);
  const [profileImageY, setProfileImageY] = useState(0);
  const [profileImageScale, setProfileImageScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const check = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include',
      });
      if (!check.ok) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/profile', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setDisplayName(data.username);
        setEmail(data.email);
        setProfileImage(data.profile_image);
        setProfileImageX(data.profile_image_x || 0);
        setProfileImageY(data.profile_image_y || 0);
        setProfileImageScale(data.profile_image_scale || 1);
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

    const check = await fetch('http://localhost:5000/auth/check', {
      credentials: 'include',
    });
    if (!check.ok) {
      alert("No token found. Please login.")
      return
    }	

    try {
      if (displayName.length > 32) throw new Error('Username is too long. Between 1-32 characters please.');
      if (displayName.length == 0) throw new Error('Username cannot be empty');

      const response = await fetch('http://localhost:5000/profile/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: displayName }),
      });

      if (!response.ok) {
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async ({ file, x, y, scale }) => {
    if (!file) return;

    const check = await fetch('http://localhost:5000/auth/check', {
      credentials: 'include',
    });
    if (!check.ok) {
      alert("No token found. Please login.")
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      formData.append('x_offset', x);
      formData.append('y_offset', y);
      formData.append('scale', scale);

      const response = await fetch('http://localhost:5000/profile/picture', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      setProfileImage(data.profile_image);
      setProfileImageX(data.profile_image_x);
      setProfileImageY(data.profile_image_y);
      setProfileImageScale(data.profile_image_scale);
      setIsEditModalOpen(false);
      setSelectedImage(null);
      setSelectedFile(null);
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error updating profile picture.');
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
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={`flex-1 p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="flex items-center mb-8">
        <div className="mr-6">
          <ProfileImage 
            profileImage={profileImage}
            profileImageX={profileImageX}
            profileImageY={profileImageY}
            profileImageScale={profileImageScale}
            onImageClick={handleImageChange}
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

      <ImageEditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedImage(null);
          setSelectedFile(null);
        }}
        imageUrl={selectedImage}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Profile;