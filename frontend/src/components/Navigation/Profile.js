import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';

const Profile = ({ isCollapsed, darkMode }) => {
  return (
    <div className={`p-3 transition-all duration-300 ease-in-out ${
      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="User" />
            <AvatarFallback>BD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-black'
              }`}>Big D</div>
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
            <LogOut className={`h-4 w-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Profile;