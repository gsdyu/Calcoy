import { useState } from 'react';

export const useProfile = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: 'Your Name',
    profileImage: '/api/placeholder/48/48'
  });

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleProfileSave = (newData) => {
    setProfileData(newData);
    handleProfileClose();
  };

  return {
    isProfileOpen,
    profileData,
    handleProfileOpen,
    handleProfileClose,
    handleProfileSave
  };
};