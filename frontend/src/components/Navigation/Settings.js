import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import MenuItem from './MenuItem';

const Settings = ({ isCollapsed, activeItem, setActiveItem, darkMode }) => {
  return (
    <MenuItem 
      icon={SettingsIcon} 
      label="Settings" 
      isActive={activeItem === 'Settings'} 
      onClick={() => setActiveItem('Settings')} 
      collapsed={isCollapsed}
      darkMode={darkMode}
    />
  );
};

export default Settings;