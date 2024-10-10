import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';

const Profile = ({ isCollapsed, darkMode }) => {
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [error, setError] = useState('');

  // Function to get initials from the user's name
  const getInitials = (name) => {
    if (!name) return ''; // Return an empty string if the name is undefined or empty
    const initials = name.split(' ').map(part => part[0]).join('');
    return initials.toUpperCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

      if (!token) {
        setError('No token found. Please login.');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass token for authorization
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUserName(data.username);
        setProfileImage(data.profile_image);

      } catch (error) {
        setError('Error fetching profile.');
        console.error('Error:', error);
      }
    };

    fetchProfile();
  }, []); // Fetch profile on component mount

  return (
    <div className={`p-3 transition-all duration-300 ease-in-out ${
      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {profileImage ? (
              <AvatarImage src={`http://localhost:5000/${profileImage}`} alt={userName} />
            ) : (
              <AvatarFallback className={darkMode ? 'text-white bg-gray-600' : ''}>
                {getInitials(userName)}
              </AvatarFallback>
            )}
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                {userName || 'User'}
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-1 ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
          >
            <LogOut className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-500'}`} />
          </Button>
        )}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Profile;