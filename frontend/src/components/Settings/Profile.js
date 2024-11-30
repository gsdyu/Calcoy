import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Shield, Edit2, Check, Edit } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ImageEditModal from '@/components/Modals/ImageEditModal';

const DefaultProfileIcon = () => (
  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ProfileImage = ({ 
  profileImage, 
  onImageClick 
}) => {
  const fileInputRef = useRef(null);
  const { darkMode } = useTheme();

  return (
    <div 
      className={`relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group
        ${darkMode ? 'bg-gray-900/40' : 'bg-white'}`}
      onClick={() => fileInputRef.current.click()}
    >
      <div className="w-full h-full">
        {profileImage ? (
          <img 
            src={`http://localhost:5000/${profileImage}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <DefaultProfileIcon />
        )}
      </div>

      {/* Edit Overlay */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Edit className="text-white" size={20} />
      </div>

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
      const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
        credentials: 'include',
      });
      if (!check.ok) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, {
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

    const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
      credentials: 'include',
    });
    if (!check.ok) {
      alert("No token found. Please login.")
      return
    }	

    try {
      if (displayName.length > 32) throw new Error('Username is too long. Between 1-32 characters please.');
      if (displayName.length === 0) throw new Error('Username cannot be empty');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: displayName }),
      });

      if (!response.ok) {
        if (response.status === 409) throw new Error(`Username ${displayName} is already taken`);
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

const ProfileSection = ({ title, description, icon: Icon, action, onClick }) => (
  <div className={`p-6 rounded-2xl transition-colors ${
    darkMode 
      ? 'bg-gray-900/40 border border-gray-800 hover:bg-gray-800/40' 
      : 'bg-white border border-gray-200 hover:bg-gray-50'
  }`}>
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-xl ${darkMode ? 'bg-[#2A2D34]' : 'bg-gray-100'}`}>
        <Icon className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={20} />
      </div>
      <div>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
    <button 
      onClick={onClick} 
      className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium 
        hover:bg-blue-600 transition-all duration-200"
    >
      {action}
    </button>
  </div>
);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-md mx-auto mt-8 p-4 rounded-2xl ${
        darkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-500'
      }`}>
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className={`text-2xl font-semibold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Profile Settings
      </h1>

      {/* Profile Card */}
      <div className={`mb-8 p-6 rounded-2xl transition-colors ${
        darkMode 
          ? 'bg-gray-900/40 border border-gray-800 hover:bg-gray-800/40' 
          : 'bg-white border border-gray-200 hover:bg-gray-50'
      }`}>
        <div className="flex items-center gap-6">
          <ProfileImage 
            profileImage={profileImage}
            onImageClick={handleImageChange}
          />
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`text-xl font-semibold bg-transparent border-b-2 px-1 focus:outline-none
                    ${darkMode 
                      ? 'border-gray-700 text-white focus:border-blue-500' 
                      : 'border-gray-200 text-gray-900 focus:border-blue-500'}`}
                />
                <button 
                  onClick={handleNameSave}
                  className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {displayName}
                </h2>
                <button 
                  onClick={handleNameEdit}
                  className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileSection
          title="Personal Information"
          description="Manage your personal information and how it appears to others"
          icon={User}
          action="Edit Information"
        />
        
        <ProfileSection
          title="Account Settings"
          description="Update your account settings and preferences"
          icon={Lock}
          action="Manage Account"
        />
        
        <ProfileSection
          title="Privacy Controls"
          description="Control your privacy settings and manage data sharing"
          icon={Shield}
          action="Adjust Privacy"
          onClick={() => window.location.href = '/Privacy'}   
        />

        
        <ProfileSection
          title="Notification Preferences"
          description="Customize how and when you receive notifications"
          icon={Bell}
          action="Set Preferences"
        />
      </div>

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
