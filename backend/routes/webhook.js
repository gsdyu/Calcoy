const fetch = require('node-fetch');
const extractUserIdFromChannelId = (channelId) => {
    return channelId.split('-')[1]; // Assuming channelId format is `channel-<userId>`
  };
// Function to process Google Calendar webhook notifications
const handleGoogleCalendarWebhook = (pool) => async (req, res) => {
    const channelId = req.headers['x-goog-channel-id'];
    const resourceId = req.headers['x-goog-resource-id'];

    if (!channelId || !resourceId) {
        return res.status(400).send('Missing required headers');
    }
const getUserAccessToken = async (userId, pool) => {
  const result = await pool.query('SELECT access_token FROM users WHERE id = $1', [userId]);
  return result.rows[0]?.access_token;
};
    try {
        const userId = extractUserIdFromChannelId(channelId); // Implement this function based on your channel ID format
        const accessToken = await getUserAccessToken(userId, pool); // Retrieve the user's access token

        // Fetch the updated event details
        const eventResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${resourceId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (eventResponse.ok) {
            const event = await eventResponse.json();
            await saveOrUpdateEventInDatabase(userId, event, pool); // Update the DB with the event data
            res.status(200).send('Event received and processed');
        } else {
            throw new Error('Failed to fetch event details');
        }
    } catch (error) {
        console.error('Error processing Google Calendar webhook:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = handleGoogleCalendarWebhook;
