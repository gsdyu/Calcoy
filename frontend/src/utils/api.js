// utils/api.js

export const fetchFriends = async () => {
  try {
    const response = await fetch('/api/friends'); // Adjust the endpoint as needed for your setup
    if (!response.ok) {
      throw new Error(`Failed to fetch friends: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};
