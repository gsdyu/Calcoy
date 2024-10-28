import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// The SharedCalendar component now supports group-based calendar views
const SharedCalendar = ({ selectedGroup }) => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();
  const { groupId } = router.query;

  // Fetch users and events for the selected group when the component mounts or when the selected group changes
  useEffect(() => {
    if (groupId) {
      // Fetch users for the group
      fetch(`/api/groups/${groupId}/users`)
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          setVisibleUsers(data.map(user => user.id)); // Make all users visible by default
        })
        .catch((error) => console.error('Error fetching group users:', error));

      // Fetch events for the selected group
      fetch(`/api/groups/${groupId}/events`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data);
          setFilteredEvents(data); // Show all events by default
        })
        .catch((error) => console.error('Error fetching group events:', error));
    }
  }, [groupId]);

  // Toggle user visibility
  const handleToggleUser = (userId) => {
    setVisibleUsers((prevVisibleUsers) =>
      prevVisibleUsers.includes(userId)
        ? prevVisibleUsers.filter(id => id !== userId)
        : [...prevVisibleUsers, userId]
    );
  };

  // Filter events based on visible users and selected date
  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        visibleUsers.includes(event.userId) &&
        new Date(event.start_time).toDateString() === selectedDate.toDateString()
    );
    setFilteredEvents(filtered);
  }, [events, visibleUsers, selectedDate]);

  // Update date filter for the shared calendar
  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
  };

  return (
    <div className="shared-calendar-page p-4">
      <h1 className="text-2xl font-bold mb-4">
        {selectedGroup ? `${selectedGroup.name} Calendar` : 'Shared Calendar'}
      </h1>

      {/* Group date selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Checkboxes to toggle user calendars */}
      <div className="user-checkboxes mb-6">
        <h2 className="text-lg font-semibold mb-2">Filter by Members</h2>
        {users.map(user => (
          <div key={user.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={visibleUsers.includes(user.id)}
              onChange={() => handleToggleUser(user.id)}
              className="mr-2"
            />
            <label>{user.name}</label>
          </div>
        ))}
      </div>

      {/* Display calendar events based on visible users */}
      <div className="calendar-events">
        <h2 className="text-lg font-semibold mb-2">Events</h2>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event border p-2 mb-2 rounded-md shadow-sm">
              <strong>{event.title}</strong> <br />
              Date: {new Date(event.start_time).toLocaleDateString()} <br />
              Time: {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()} <br />
              Organizer: {event.userName} <br />
              Description: {event.description || 'No description provided'}
            </div>
          ))
        ) : (
          <p>No events available for the selected date and members.</p>
        )}
      </div>
    </div>
  );
};

export default SharedCalendar;
