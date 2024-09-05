import React from 'react';

const Profile = () => {
  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
        <p className="text-gray-600 mb-6">Manage your person information</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          Edit Information
        </button>
      </div>
    </div>
  );
};

export default Profile;