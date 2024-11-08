'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './AiPage.module.css';
import { MoveUp, ArrowUp, Sparkles, CirclePlus, CircleX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import EventDetailsBox from './EventDetailsBox';
import LoadingCircle from './LoadingCircle';
import NotificationSnackbar from '@/components/Modals/NotificationSnackbar';
import AiPromptExamples from './StartPrompt';
import ChatSidebar from './ChatSidebar';
import DeleteChatModal from './DeleteChatModal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const textareaRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Fetch existing conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:5000/conversations', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error fetching conversations: ${response.statusText}`);
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        showNotification('Failed to load conversations.');
      }
    };

    fetchConversations();
  }, []);

  // Handle selecting a conversation
  const handleChatSelect = async (chatId) => {
    setCurrentChatId(chatId);
    setMessages([]);
    setShowPrompts(false);
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/conversations/${chatId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error fetching conversation: ${response.statusText}`);
      }

      const data = await response.json();
      const formattedMessages = data.map((msg) => ({
        sender: msg.sender === 'model' ? 'bot' : msg.sender,
        text: msg.content,
        eventDetails: msg.sender === 'model' && isJson(msg.content) ? JSON.parse(msg.content).eventDetails : null,
      }));

      setMessages(formattedMessages);
      setShowPrompts(false);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      showNotification('Failed to load the selected conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  // Handle creating a new conversation
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setShowPrompts(true);
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/conversations/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error(`Error renaming conversation: ${response.statusText}`);
      }

      // local update
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      );
      showNotification('Conversation renamed successfully.');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      showNotification('Failed to rename conversation.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    setChatToDelete(chatId);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/conversations/${chatToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete conversation.');
      }
  
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatToDelete));
  
      if (currentChatId === chatToDelete) {
        setCurrentChatId(null);
        setMessages([]);
        setShowPrompts(true);
      }
  
      showNotification('Conversation deleted successfully.');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showNotification(`Failed to delete conversation: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };
  

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
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.eventDetails?.id === eventId) {
            return {
              ...msg,
              eventDetails: editedDetails,
            };
          }
          return msg;
        })
      );

      // Then, update the eventDetails state
      setEventDetails((prevDetails) =>
        prevDetails.map((detail) => (detail.id === eventId ? editedDetails : detail))
      );
    } catch (error) {
      console.error('Error updating event:', error);
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'There was an error updating the event.',
        },
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setShowPrompts(false);

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);

    const payload = {
      message: input,
    };
    if (currentChatId) {
      payload.conversationId = currentChatId;
    }

    try {
      const response = await fetch('http://localhost:5000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from AI:', data);

      // If it's a new conversation, add it to the chats list
      if (!currentChatId && data.conversationId) {
        setChats((prevChats) => [
          {
            id: data.conversationId,
            title: 'New Conversation',
            created_at: new Date().toISOString(),
          },
          ...prevChats,
        ]);
        setCurrentChatId(data.conversationId);
      }

      const eventDetailsMatch = data.message.match(/Details:\s*(.*)$/);
      let newEventDetails = null;

      if (eventDetailsMatch && eventDetailsMatch[1]) {
        try {
          newEventDetails = JSON.parse(eventDetailsMatch[1]);
        } catch (parseError) {
          console.error('Failed to parse event details:', parseError);
        }

        if (newEventDetails) {
          const newEventId = Date.now();

          setEventDetails((prev) => [...prev, { ...newEventDetails, id: newEventId }]);
          setHandledEvents((prev) => ({ ...prev, [newEventId]: false }));

          const botMessage = {
            sender: 'bot', // Ensure sender is 'bot'
            text: `Do you want to create the following event?`,
            eventDetails: { ...newEventDetails, id: newEventId },
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      } else {
        const botMessage = { sender: 'bot', text: data.message };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { sender: 'bot', text: 'There was an error processing your request.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      showNotification('Failed to send message.');
    } finally {
      setIsLoading(false);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleConfirm = async (eventId, editedDetails = null) => {
    const eventToConfirm = editedDetails || eventDetails.find((event) => event.id === eventId);

    try {
      showNotification('Saving event...');
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
      showNotification('Event saved successfully.');
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Your new event has been created: ${result.event.title}` },
      ]);
      setHandledEvents((prev) => ({ ...prev, [eventId]: true }));
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification('Failed to create event.');
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Error creating event.' }]);
    }
  };

  const handleDeny = (eventId) => {
    setHandledEvents((prev) => ({ ...prev, [eventId]: true }));
    setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Event creation canceled.' }]);
    showNotification('Event creation canceled.');
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
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  return (
    <div className="flex h-screen">
      <div className={`${styles.container} flex-1`}>
        <h1 className={styles.aiheader}>
          Timewise AI<Sparkles className={styles.ailogo} />
        </h1>

        <AiPromptExamples onExampleClick={handleExampleClick} visible={showPrompts && messages.length === 0} />

        <div ref={chatWindowRef} className={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender === 'user'
                  ? darkMode
                    ? styles.userDark
                    : styles.user
                  : darkMode
                  ? styles.botDark
                  : styles.bot
              }`}
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
            className={`${styles.button} ${
              input.trim() ? (darkMode ? styles.buttonActiveDark : styles.buttonActive) : ''
            } ${darkMode ? styles.buttonDark : styles.buttonLight}`}
          >
            <ArrowUp strokeWidth={2.5} className={styles.sendicon} />
          </button>
        </form>

        <NotificationSnackbar
          message={notification.message}
          action={notification.action}
          isVisible={notification.isVisible}
          onActionClick={() => {
            console.log('placeholder');
          }}
        />

        <DeleteChatModal 
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          chatTitle={chats.find(c => c.id === chatToDelete)?.title}
        />
      </div>

      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onRename={handleRenameChat}
        onDelete={handleDeleteChat}
        chats={chats}
        darkMode={darkMode}
      />
    </div>
  );
};

export default AiPage;
