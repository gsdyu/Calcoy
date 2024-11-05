import React, { useState } from 'react';
import SharedCalendar from '@/components/SharedCalendar'; // Import the SharedCalendar component
import CreateServerModal from '@/components/Modals/CreateServerModal'; // Make sure this component is imported
import GroupList from '@/components/Sidebar/GroupList'; // Import the GroupList for group selection

const Calendar = () => {
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // State for the selected group
  const [isGroupView, setIsGroupView] = useState(false); // State to toggle between personal and group calendar

  // Function to open the modal to create a server (group)
  const openCreateServerModal = () => {
    setShowCreateServerModal(true);
  };

  // Function to handle group selection from the GroupList
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setIsGroupView(true); // Switch to group view when a group is selected
  };

  // Function to toggle back to the personal calendar view
  const handleToggleView = () => {
    setIsGroupView(false);
    setSelectedGroup(null); // Clear selected group when switching to personal view
  };

  return (
    <div className="calendar-page p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isGroupView && selectedGroup ? `${selectedGroup.name} Calendar` : 'My Personal Calendar'}
      </h1>

      {/* Toggle button to switch between personal and group calendars */}
      <button
        onClick={isGroupView ? handleToggleView : openCreateServerModal}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        {isGroupView ? 'Switch to Personal Calendar' : 'Create Server'}
      </button>

      {/* Show the group selection list when not in group view */}
      {!isGroupView && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Select a Group</h2>
          <GroupList onGroupSelect={handleGroupSelect} /> {/* Display groups to select */}
        </div>
      )}

      {/* Show shared calendar when a group is selected */}
      {isGroupView && selectedGroup ? (
        <SharedCalendar
          selectedGroup={selectedGroup}
        />
      ) : (
        <p className="mt-6">View and manage your personal calendar or select a group to view shared events.</p>
      )}

      {/* Modal for creating a server */}
      {showCreateServerModal && (
        <CreateServerModal onClose={() => setShowCreateServerModal(false)} />
      )}
    </div>
  );
};

export default Calendar;
