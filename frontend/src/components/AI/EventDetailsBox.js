import React, { useState } from 'react';
import { CirclePlus, CircleX, Edit2, Save, X } from 'lucide-react';
import styles from './AiPage.module.css';

const EventDetailsBox = ({ 
  eventDetails, 
  onConfirm, 
  onDeny, 
  onEdit,
  isHandled,
  darkMode 
}) => {
  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      const displayDate = date.toLocaleDateString();
      const displayTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return { date: displayDate, time: displayTime };
    } catch (error) {
      console.error('Display formatting error:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    id: eventDetails.id,
    title: eventDetails.title,
    start_time: formatDateForInput(eventDetails.start_time),
    end_time: formatDateForInput(eventDetails.end_time),
    description: eventDetails.description
  });

  const handleEdit = () => {
    setEditedDetails({
      ...eventDetails,
      start_time: formatDateForInput(eventDetails.start_time),
      end_time: formatDateForInput(eventDetails.end_time)
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const startDate = new Date(editedDetails.start_time);
      const endDate = new Date(editedDetails.end_time);
      
      const updatedDetails = {
        ...editedDetails,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      };
      
      await onEdit(eventDetails.id, updatedDetails);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  const handleCancel = () => {
    setEditedDetails({
      ...eventDetails,
      start_time: formatDateForInput(eventDetails.start_time),
      end_time: formatDateForInput(eventDetails.end_time)
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  React.useEffect(() => {
    setEditedDetails({
      ...eventDetails,
      start_time: formatDateForInput(eventDetails.start_time),
      end_time: formatDateForInput(eventDetails.end_time)
    });
  }, [eventDetails]);

  if (isEditing) {
    return (
      <div className={styles.eventDetailsBox}>
        <label className={`${styles.editlabel} ${darkMode ? styles.editlabelDark : ''}`}>Event name</label>
        <input
          type="text"
          name="title"
          value={editedDetails.title}
          onChange={handleInputChange}
          className={`${styles.editInput} ${darkMode ? styles.editInputDark : ''}`}
        />
        <div className={styles.dateTimeInputGroup}>
          <label className={`${styles.editlabel} ${darkMode ? styles.editlabelDark : ''}`} >Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            value={editedDetails.start_time}
            onChange={handleInputChange}
            className={`${styles.editInput} ${darkMode ? styles.editInputDark : ''}`}
          />
        </div>
        <div className={styles.dateTimeInputGroup}>
          <label className={`${styles.editlabel} ${darkMode ? styles.editlabelDark : ''}`}>End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            value={editedDetails.end_time}
            onChange={handleInputChange}
            className={`${styles.editInput} ${darkMode ? styles.editInputDark : ''}`}
          />
        </div>
        <label className={`${styles.editlabel} ${darkMode ? styles.editlabelDark : ''}`} >Description</label>
        <textarea
          name="description"
          value={editedDetails.description}
          onChange={handleInputChange}
          className={`${styles.editTextarea} ${darkMode ? styles.editTextareaDark : ''}`}
        />
        <div className={styles.buttonSection}>
          <div className={styles.buttonContainer}>
            <button onClick={handleSave} className={styles.confirmButton}>
              <Save /> Save
            </button>
            <button onClick={handleCancel} className={styles.denyButton}>
              <X /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startDateTime = formatDateForDisplay(eventDetails.start_time);
  const endDateTime = formatDateForDisplay(eventDetails.end_time);

  return (
    <div className={styles.eventDetailsBox}>
      <div className={styles.titleRow}>
        <h1 className={styles.eventTitle}>{eventDetails.title}</h1>
        {!isHandled && (
          <button onClick={handleEdit} className={styles.editButton}>
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>
      <p>{startDateTime.date}</p>
      <p className={styles.eventTime}>
        {startDateTime.time} - {endDateTime.time}
      </p>
      <p className={styles.eventDescription}>{eventDetails.description}</p>
      
      {!isHandled && (
        <div className={styles.buttonSection}>
          <div className={styles.buttonContainer}>
            <button onClick={() => onConfirm(eventDetails.id)} className={styles.confirmButton}>
              <CirclePlus /> Confirm
            </button>
            <button onClick={() => onDeny(eventDetails.id)} className={styles.denyButton}>
              <CircleX /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsBox;