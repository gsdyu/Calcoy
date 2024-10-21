'use client';
 
import React, { useState, useEffect, useRef } from 'react';
import styles from './AiPage.module.css';
import { MoveUp } from 'lucide-react';
import { ArrowUp } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { CirclePlus } from 'lucide-react';
import { CircleX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const AiPage = () => {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [eventDetails, setEventDetails] = useState(null);

  const textareaRef = useRef(null);
  const chatWindowRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input) console.error();
  
    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const token = localStorage.getItem('token');
    if (!token) {
      //handle error, i didnt read yet how to handle here
      console.error('not login')
    }
  
    // groq api
    try {
      const response = await fetch('http://localhost:5000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}, ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Response from AI:', data);
  
      const eventDetailsMatch = data.message.match(/Details:\s*(.*)$/);
      let eventDetails = null;
  
      if (eventDetailsMatch && eventDetailsMatch[1]) {
        eventDetails = JSON.parse(eventDetailsMatch[1]);
  
        setEventDetails(eventDetails);
        
        const botMessage = {
          sender: 'bot',
          text: `Do you want to create the following event?`,
          eventDetails,
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
    }
  
    setInput('');
    textareaRef.current.style.height = 'auto';
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventDetails),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}, ${response.statusText}`);
      }

      const result = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Your new event has been created: ${result.event.title}` },
      ]);
      setEventDetails(null);
    } catch (error) {
      console.error('Error creating event:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Error creating event.' }]);
    }
  };

  const handleDeny = () => {
    setEventDetails(null);
    setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Event creation canceled.' }]);
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

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.aiheader}>Timewise AI<Sparkles className={styles.ailogo}/></h1>
        <h2 className={styles.aisubheader}>How can I help you?</h2>
        <div ref={chatWindowRef} className={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.sender === 'user' ? (darkMode ? styles.userDark : styles.user) : (darkMode ? styles.botDark : styles.bot)}`}
            >
              {msg.text}
              {msg.eventDetails && (
                <div className={styles.eventDetailsBox}> {/* Add a wrapper div for styling */}
                  <h1 className={styles.eventTitle}>{msg.eventDetails.title}</h1>
                  <p><strong>Date:</strong> {new Date(msg.eventDetails.start_time).toLocaleDateString()}</p>
                  <p><strong>Start Time:</strong> {new Date(msg.eventDetails.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>End Time:</strong> {new Date(msg.eventDetails.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Location:</strong> {msg.eventDetails.location}</p>
                  <p><strong>Description:</strong> {msg.eventDetails.description}</p>
                  <div>
                  <div className={styles.buttonContainer}>
                    <button onClick={handleConfirm} className={styles.confirmButton}>
                      <CirclePlus /> Confirm
                    </button>
                    <button onClick={handleDeny} className={styles.denyButton}>
                      <CircleX /> Discard
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </div>
          ))}
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
      </div>
    </>
  );
};

export default AiPage;
