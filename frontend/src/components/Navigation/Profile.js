import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Profile = ({ isCollapsed, darkMode, colors }) => {
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to get initials from the user's name
  const getInitials = (name) => {
    if (!name) return ''; // Return an empty string if the name is undefined or empty
    const initials = name.split(' ').map(part => part[0]).join('');
    return initials.toUpperCase();
  };

  const toggleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
      })
      const data = await response.json();

      if (response.ok) {
        router.push('/')
      } else {
        setError(data.message || "Error occurred while logging out");
      }
    } catch (error) {
      console.error(`Error occurred while logging out: ${error}`);
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const check = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!check.ok) {
        setError('No token found. Please login.');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
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
      darkMode ? `${colors.background} bg-opacity-50` : 'bg-gray-50/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {profileImage ? (
              <AvatarImage src={`${process.env.NEXT_PUBLIC_SERVER_URL}/${profileImage}`} alt={userName} />
            ) : (
              <AvatarFallback className={`${colors.buttonBg} ${colors.text}`}>
                {getInitials(userName)}
              </AvatarFallback>
            )}
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <div className={`text-sm font-medium ${colors.text}`}>
                {userName || 'User'}
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-1 ${colors.buttonBg}`}
            onClick={toggleLogout}
          >
            <LogOut className={`h-4 w-4 ${colors.textSecondary}`} />
          </Button>
        )}
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default Profile;