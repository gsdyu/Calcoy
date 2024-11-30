"use client";

import React, { useState, useEffect } from "react";
import { Shield, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

const PrivacyControl = () => {
  const [privacyOptions] = useState([
    { id: "public", label: "Public: All friends can see event details", description: "Details of your events are visible to all friends." },
    { id: "limited", label: "Limited: Friends see name and time only", description: "Friends can only view the username and time." },
    { id: "private", label: "Private: Not visible to friends", description: "Your events are completely hidden from friends." },
  ]);
  const [defaultPrivacy, setDefaultPrivacy] = useState("public");
  const [serverPrivacy, setServerPrivacy] = useState({});
  const [servers, setServers] = useState([]);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/servers', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch servers');

        const data = await response.json();
        setServers(data.servers || []);
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    fetchServers();
  }, []);
  
  const { darkMode, selectedTheme, presetThemes, colors } = useTheme();
  const router = useRouter();

  const backgroundClasses = selectedTheme
    ? `${presetThemes[selectedTheme]?.gradient}`
    : darkMode
    ? "bg-gray-900"
    : "bg-white";

  const cardBackgroundClasses = selectedTheme
    ? `${colors.buttonBg} border ${colors.buttonBorder}`
    : darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-50 border-gray-200";

  const textClasses = selectedTheme
    ? colors.text
    : darkMode
    ? "text-gray-200"
    : "text-gray-900";

  const secondaryTextClasses = selectedTheme
    ? colors.textSecondary
    : darkMode
    ? "text-gray-400"
    : "text-gray-600";

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/privacy-setting`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText} (${response.status})`);

      const data = await response.json();
      setDefaultPrivacy(data.defaultPrivacy || "public");
      setServerPrivacy(data.serverPrivacy || {});
      setServers(data.servers || []);
      setUserId(data.userId);
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      alert("Failed to fetch privacy settings.");
    }
  };

  const savePrivacySettings = async (privacy, serverId = null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/privacy-setting`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, privacy: newPrivacy }), // Include userId and new privacy setting
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText} (${response.status})`);

      if (serverId) {
        setServerPrivacy({ ...serverPrivacy, [serverId]: privacy });
      } else {
        setDefaultPrivacy(privacy);
      }
      alert("Privacy setting updated successfully!");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      alert("Failed to update privacy settings.");
    }
  };

  const handleBack = () => {
    router.push("/settings");
  };
  const renderServerItem = (server) => {
    const privacy = serverPrivacy[server.id] || "public";
  
    return (
      <div key={server.id} className="mb-4">
        <div className="flex items-center mb-2">
        {server.image_url ? (
            <img
              src={`http://localhost:5000${server.image_url}`}
              alt={`${server.name} icon`}
              className="w-6 h-6 mr-2 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = "/default-server-icon.png"; // Fallback to a default icon
              }}
            />
          ) : (
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs">
              {server.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className={`text-lg font-medium ${textClasses}`}>{server.name}</h3>
        </div>
        <div className="space-y-2">
          {privacyOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                privacy === option.id ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"
              }`}
              onClick={() => savePrivacySettings(option.id, server.id)}
            >
              <h4 className={`text-base font-medium ${privacy === option.id ? "text-blue-900" : textClasses}`}>
                {option.label}
              </h4>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  return (
    <div className={`min-h-screen ${backgroundClasses} p-8`}>
      <div className="flex items-center mb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            darkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <h1 className={`text-2xl font-semibold mb-8 ${textClasses}`}>Privacy Settings</h1>

      <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition-all ${cardBackgroundClasses}`}>
        <h2 className={`text-lg font-semibold mb-4 ${textClasses}`}>Default Privacy Options</h2>
        <div className="space-y-4">
          {privacyOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                defaultPrivacy === option.id ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"
              }`}
              onClick={() => savePrivacySettings(option.id)}
            >
              <h3 className={`text-lg font-medium ${defaultPrivacy === option.id ? "text-blue-900" : textClasses}`}>
                {option.label}
              </h3>
              <p className={`text-sm ${secondaryTextClasses}`}>{option.description}</p>
              {defaultPrivacy === option.id && (
                <div className="mt-2 text-blue-500">
                  <Check size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition-all mt-8 ${cardBackgroundClasses}`}>
        <h2 className={`text-lg font-semibold mb-4 ${textClasses}`}>Server Privacy Options</h2>
        {servers.length === 0 ? (
          <p className={`text-sm ${secondaryTextClasses}`}>No servers available.</p>
        ) : (
          servers.map((server) => renderServerItem(server))
        )}
      </div>
    </div>
  );
};

export default PrivacyControl;
