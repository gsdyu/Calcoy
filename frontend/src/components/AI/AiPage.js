'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './AiPage.module.css';
import { MoveUp } from 'lucide-react';
import { Sparkles } from 'lucide-react';

const AiPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

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
    };
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

      const botMessage = { sender: 'bot', text: data.message };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { sender: 'bot', text: 'There was an error' };
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    }

    setInput('');
    textareaRef.current.style.height = 'auto';
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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
        <div className={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <textarea 
            ref={textareaRef}
            value={input} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress}
            placeholder="Ask Timewise AI" 
            className={styles.textarea} 
            rows={1}
          />
          <button type="submit" className={`${styles.button} ${input.trim() ? styles.buttonActive : ''}`}><MoveUp className={styles.sendicon}/></button>
        </form>
      </div>
    </>
  );
};

export default AiPage;
