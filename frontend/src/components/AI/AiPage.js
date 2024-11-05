'use client';
 
import React, { useState, useEffect, useRef } from 'react';
import styles from './AiPage.module.css';
import { MoveUp } from 'lucide-react';
import { ArrowUp } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { CirclePlus } from 'lucide-react';
import { CircleX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import EventDetailsBox from './EventDetailsBox';
import LoadingCircle from './LoadingCircle';
import NotificationSnackbar from '@/components/Modals/NotificationSnackbar';
import AiPromptExamples from './StartPrompt';

const AiPage = () => {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);
  const [handledEvents, setHandledEvents] = useState({});
  const [notification, setNotification] = useState({ message: '', action: '', isVisible: false });
  const [lastUpdatedEvent, setLastUpdatedEvent] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);

  const textareaRef = useRef(null);
  const chatWindowRef = useRef(null);

  const handleExampleClick = (text) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleEdit = async (eventId, editedDetails) => {
    try {
      // First, update the message in the messages state
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.eventDetails?.id === eventId) {
            return {
              ...msg,
              eventDetails: editedDetails
            };
          }
          return msg;
        })
      );

      // Then, update the eventDetails state
      setEventDetails(prevDetails =>
        prevDetails.map(detail =>
          detail.id === eventId ? editedDetails : detail
        )
      );

    } catch (error) {
      console.error('Error updating event:', error);
      // Add an error message
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'There was an error updating the event.'
      }]);
      // You might want to revert the changes in the UI here
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!input) console.error();

    setShowPrompts(false);
  
    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const check = await fetch('http://localhost:5000/auth/check', {
      method: 'GET',
      credentials: 'include',
    })
    if (!check.ok) {
      //handle error, i didnt read yet how to handle here
      console.error('not login')
      setIsLoading(false);
    }

    setIsLoading(true);
  
    // groq api
    try {
      const response = await fetch('http://localhost:5000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: input }),
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}, ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Response from AI:', data);
  
      const eventDetailsMatch = data.message.match(/Details:\s*(.*)$/);
      let newEventDetails = null;
  
      if (eventDetailsMatch && eventDetailsMatch[1]) {
        newEventDetails = JSON.parse(eventDetailsMatch[1]);
        const newEventId = Date.now();
  
        setEventDetails((prev) => [...prev, { ...newEventDetails, id: newEventId }]);
        setHandledEvents((prev) => ({ ...prev, [newEventId]: false }));
        
        const botMessage = {
          sender: 'bot',
          text: `Do you want to create the following event?`,
          eventDetails: { ...newEventDetails, id: newEventId },
        };
  
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const botMessage = { sender: 'bot', text: data.message };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
  
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { sender: 'bot', text: 'There was an error' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      textareaRef.current.style.height = 'auto';
    }
  
    setInput('');
    textareaRef.current.style.height = 'auto';
  };

  const handleConfirm = async (eventId, editedDetails = null) => {
    const eventToConfirm = editedDetails || eventDetails.find(event => event.id === eventId);

    try {
      showNotification(`Saving event...`);
      const response = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventToConfirm),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}, ${response.statusText}`);
      }

      const result = await response.json();
      showNotification(`Event saved successfully`);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Your new event has been created: ${result.event.title}` },
      ]);
      setHandledEvents((prev) => ({ ...prev, [eventId]: true }));
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification(`Failed to create event`)
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Error creating event.' }]);
    }
  };

  const handleDeny = (eventId) => {
    setHandledEvents((prev) => ({ ...prev, [eventId]: true }));
    setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Event creation canceled.' }]);
    showNotification("Event creation canceled")
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);


  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const showNotification = (message, action = '') => {
    setNotification({ message, action, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };


  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.aiheader}>Timewise AI<Sparkles className={styles.ailogo}/></h1>

        <AiPromptExamples 
          onExampleClick={handleExampleClick}
          visible={showPrompts && messages.length === 0}
        />

        <div ref={chatWindowRef} className={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.sender === 'user' ? (darkMode ? styles.userDark : styles.user) : (darkMode ? styles.botDark : styles.bot)}`}
            >
              {msg.sender === 'bot' && (
                <div className={`${styles.botIconContainer} ${darkMode ? styles.botIconContainerDark : ''}`}>
                  <Sparkles size={16} className={styles.botIcon} />
                </div>
              )}
              <div className={styles.messageContent}>
                {msg.text}
                {msg.eventDetails && (
                  <EventDetailsBox
                    eventDetails={msg.eventDetails}
                    onConfirm={handleConfirm}
                    onDeny={handleDeny}
                    onEdit={handleEdit}
                    isHandled={handledEvents[msg.eventDetails.id]}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${darkMode ? styles.botDark : styles.bot}`}>
              <div className={`${styles.botIconContainer} ${darkMode ? styles.botIconContainerDark : ''}`}>
                <Sparkles size={16} className={styles.botIcon} />
              </div>
              <div className={styles.messageContent}>
                <LoadingCircle />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className={`${styles.inputContainer} ${darkMode ? styles.inputContainerDark : ''}`}>
          <textarea 
            ref={textareaRef}
            value={input} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress}
            placeholder="Ask Timewise AI..." 
            className={`${styles.textarea} ${darkMode ? styles.textareaDark : ''}`} 
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`${styles.button} ${input.trim() ? (darkMode ? styles.buttonActiveDark : styles.buttonActive) : ''} ${darkMode ? styles.buttonDark : styles.buttonLight}`}>
            <ArrowUp strokeWidth={2.5} className={styles.sendicon}/>
          </button>
        </form>
        <NotificationSnackbar
          message={notification.message}
          action={notification.action}
          isVisible={notification.isVisible}
          onActionClick={() => {console.log('placeholder')}}
        />
      </div>
    </>
  );
};

export default AiPage;
