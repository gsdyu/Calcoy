import React from 'react';
import { Button } from "@/components/ui/button";

const MenuItems = ({ icon: Icon, label, isActive, onClick, collapsed, darkMode }) => {
  const textColor = darkMode
    ? isActive ? "text-white" : "text-gray-300"
    : isActive ? "text-blue-600" : "text-gray-700";

  return (
    <Button
      variant="ghost"
      className={`
        w-full flex items-center p-2 my-1 text-sm font-medium
        transition-colors duration-200
        ${textColor}
        ${darkMode 
          ? isActive ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-700"
          : isActive ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-200"
        }
      `}
      onClick={() => onClick(label)}  // Call onClick with the label
    >
      <div className="w-10 flex items-center justify-center">
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
      {!collapsed && <span className="ml-2 text-left flex-grow">{label}</span>}
    </Button>
  );
};

export default MenuItems;