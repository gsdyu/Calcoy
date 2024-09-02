import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import MenuItem from './MenuItem';

const Settings = ({ isCollapsed, activeItem, setActiveItem }) => {
  return (
    <MenuItem 
      icon={SettingsIcon} 
      label="Settings" 
      isActive={activeItem === 'Settings'} 
      onClick={() => setActiveItem('Settings')} 
      collapsed={isCollapsed}
    />
  );
};

export default Settings;