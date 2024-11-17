'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Check, X, Loader2 } from 'lucide-react';

const UsernamePage = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUsernameChange = (e) => {
      const newUsername = e.target.value.toLowerCase();
      setUsername(newUsername);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!username) return;

      setIsLoading(true);
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/set-username`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username }),
              credentials: 'include',
          });

          if (response.ok) {
              router.push('/calendar');
          } else {
              const errorData = await response.json();
              setError(errorData.error || 'An error occurred');
          }
      } catch (error) {
          setError('An unexpected error occurred');
      } finally {
          setIsLoading(false);// load
      }
  };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-400 via-purple-300 to-green-200">
            {/* Northern Lights Effect */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
                    <div className="w-72 h-72 bg-purple-200/20 rounded-full blur-2xl rotate-45"></div>
                    <div className="w-48 h-48 bg-green-200/20 rounded-full blur-xl -rotate-45"></div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md m-4 relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">Choose Your Identity</h2>
                <p className="text-gray-600 mb-6 text-center">Make your mark in our universe</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={handleUsernameChange}
                                className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-300"
                                placeholder="Choose your username"
                                required
                            />
                            {isLoading && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                            )}
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username}
                        className={`w-full py-3 rounded-xl font-medium transition-all transform hover:-translate-y-0.5 
                            ${username && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? 'Setting username...' : 'Claim Your Username'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernamePage;
