import React from 'react';
import { Button } from "@/components/ui/button";

const MenuItem = ({ icon: Icon, label, isActive, onClick, collapsed, darkMode }) => (
  <Button
    variant="ghost"
    className={`
      w-full flex items-center p-2 my-1 text-sm font-medium
      ${darkMode 
        ? "text-white hover:bg-gray-800" 
        : "text-gray-700 hover:bg-gray-100"
      }
      ${isActive && !darkMode ? "bg-blue-100 text-blue-600" : ""}
    `}
    onClick={onClick}
  >
    <div className="w-10 flex items-center justify-center">
      <Icon className={`h-5 w-5 ${darkMode ? "text-white" : ""}`} />
    </div>
    {!collapsed && <span className="ml-2 text-left flex-grow">{label}</span>}
  </Button>
);

export default MenuItem;