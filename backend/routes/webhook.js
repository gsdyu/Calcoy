const fetch = require('node-fetch');

// Helper function to extract user ID from channel ID
const extractUserIdFromChannelId = (channelId) => {
    return channelId.split('-')[1];
};

// Helper function to refresh the access token
const refreshAccessToken = async (userId, pool) => {
    const result = await pool.query('SELECT refresh_token FROM users WHERE id = $1', [userId]);
    const refreshToken = result.rows[0]?.refresh_token;

    if (!refreshToken) throw new Error('No refresh token available for user');

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Failed to refresh access token:', errorDetails);
        throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    await pool.query('UPDATE users SET access_token = $1 WHERE id = $2', [newAccessToken, userId]);
    console.log('Access token refreshed and saved for user:', userId);

    return newAccessToken;
};

// Helper function to get a valid access token
const getUserAccessToken = async (userId, pool) => {
    let result = await pool.query('SELECT access_token, refresh_token FROM users WHERE id = $1', [userId]);
    let accessToken = result.rows[0]?.access_token;
    const refreshToken = result.rows[0]?.refresh_token;
    console.log( accessToken);

    // Test the access token validity
    const testResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    if (testResponse.status === 401) {
        // If token is invalid and there's a refresh token, refresh it
        if (refreshToken) {
            console.log('Access token expired or invalid. Attempting to refresh...');
            accessToken = await refreshAccessToken(userId, pool);
        } else {
            throw new Error('No refresh token available. User reauthorization needed.');
        }
    } else {
        console.log('Access token is valid for user:', userId);
    }

    return accessToken;
};

// Main webhook handler function
const handleGoogleCalendarWebhook = (pool) => async (req, res) => {
    const channelId = req.headers['x-goog-channel-id'];
    const resourceId = req.headers['x-goog-resource-id'];

    if (!channelId || !resourceId) {
        console.error('Missing required headers in webhook request');
        return res.status(400).send('Missing required headers');
    }

    try {
        const userId = extractUserIdFromChannelId(channelId);
        const accessToken = await getUserAccessToken(userId, pool);
    
        const eventResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${resourceId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    
        if (eventResponse.ok) {
            const event = await eventResponse.json();
            await saveOrUpdateEventInDatabase(userId, event, pool);
            res.status(200).send('Event received and processed');
        } else {
            const errorDetails = await eventResponse.json();
            console.error('Failed to fetch event details:', errorDetails);
            res.status(401).send(`Failed to fetch event details: ${errorDetails.error.message}`);
        }
    } catch (error) {
        if (error.message.includes("No refresh token available")) {
            res.status(401).send('Authorization expired. Please reauthorize the application.');
        } else {
            console.error('Error processing Google Calendar webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}    

module.exports = handleGoogleCalendarWebhook;