'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const InvitePage = ({ inviteLink }) => {
  const [message, setMessage] = useState('');
  const [serverName, setServerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!inviteLink) {
      setMessage('Invalid invite link.');
      return;
    }

    // Fetch server details
    const fetchServerDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteLink }),
          credentials: 'include',
        });


        if (response.status === 401) {
          // If the user is not logged in, redirect to login
          setMessage('Unauthorized: Redirecting to login...');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
          return;
        }
    
        const data = await response.json();
    
        if (response.ok) {
          setServerName(data.serverName || 'Unnamed Server');
        } else {
          setMessage(data.error || 'Invalid invite link.');
        }
      } catch (error) {
        console.error('Error fetching server details:', error);
        setMessage('Unable to retrieve server details.');
      }
    };

    fetchServerDetails();
  }, [inviteLink]);

  const joinServer = async () => {
    if (!inviteLink) return;

    setIsJoining(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/servers/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inviteLink }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Successfully joined the server!');
        setTimeout(() => {
          router.push('/calendar'); // Redirect back to the friends page
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to join the server.');
      }
    } catch (error) {
      console.error('Error joining server:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-md p-6 text-center">
        {serverName ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800">You're Invited to {serverName}</h1>
            <p className="text-gray-600 mt-2">Join this server and start collaborating!</p>
            <button
              onClick={joinServer}
              disabled={isJoining}
              className={`mt-6 w-full px-4 py-2 text-white font-medium rounded-md ${
                isJoining ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isJoining ? 'Joining...' : 'Accept Invite'}
            </button>
          </>
        ) : (
          <h1 className="text-xl font-semibold text-gray-600">{message || 'Loading invite details...'}</h1>
        )}
        {message && !serverName && <p className="text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default InvitePage;
