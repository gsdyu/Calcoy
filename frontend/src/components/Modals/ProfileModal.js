import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

const ProfileModal = ({ onClose, onSave }) => {
  const { darkMode } = useTheme();
  const [displayName, setDisplayName] = useState('Your Name');
  const [profileImage, setProfileImage] = useState('/api/placeholder/48/48');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoom = (event) => {
    setZoom(parseFloat(event.target.value));
  };

  const handleMouseDown = (event) => {
    const startX = event.clientX - pan.x;
    const startY = event.clientY - pan.y;

    const handleMouseMove = (moveEvent) => {
      setPan({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSave = () => {
    onSave({ displayName, profileImage, zoom, pan });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96`}>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`w-full p-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} rounded`}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          <div className="relative w-32 h-32 mx-auto overflow-hidden rounded-full">
            <img
              ref={imageRef}
              src={profileImage}
              alt="Profile"
              className="absolute"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center',
              }}
              onMouseDown={handleMouseDown}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="block mt-2 text-center cursor-pointer text-blue-500 hover:text-blue-600"
          >
            Change Avatar
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={zoom}
            onChange={handleZoom}
            className="w-full mt-2"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 text-white">Save</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;