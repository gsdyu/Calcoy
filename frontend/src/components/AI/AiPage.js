'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './AiPage.module.css';
import { MoveUp, ArrowUp, Sparkles, CirclePlus, CircleX, Paperclip, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import EventDetailsBox from './EventDetailsBox';
import LoadingBars from './LoadingBars';
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
  const [selectedFile, setSelectedFile] = useState(null);
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

      let handledEventsTemp = {};
      const formattedMessages = data.map((msg) => {
        const sender = msg.sender === 'model' ? 'bot' : msg.sender;
        let text = msg.content;
        let eventDetails = null;
  
        if (sender === 'bot' && isJson(msg.content)) {
          const parsedContent = JSON.parse(msg.content);
          if (parsedContent.title && parsedContent.start_time) {
            // It's an event details message
            text = null;
            const newEventId = parsedContent.id || Date.now() + Math.random();
            eventDetails = { ...parsedContent, id: newEventId };
            handledEventsTemp[newEventId] = true;
          }
        }
  
        return {
          sender,
          text,
          eventDetails,
        };
      });

      setMessages(formattedMessages);
      setHandledEvents(handledEventsTemp);
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
    setSelectedFile(null);
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/conversations/${chatId}`, {
        method: 'PUT',
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
        setSelectedFile(null);
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    document.getElementById('fileInput').value='';
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    setShowPrompts(false);

    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
    }

    if (selectedFile) {
      const imageMessage = {
        sender: 'user',
        image: URL.createObjectURL(selectedFile),
        file: selectedFile,
      };
      setMessages((prevMessages) => [...prevMessages, imageMessage]);
    }

    setInput('');
    handleRemoveImage();


    const check = await fetch('http://localhost:5000/auth/check', {
      method: 'GET',
      credentials: 'include',
    })
    if (!check.ok) {
      console.error('not login')
      setIsLoading(false);
    }

    setIsLoading(true);
    
    const placeholderBotMessage = { sender: 'bot', isLoading: true };
    setMessages((prevMessages) => [...prevMessages, placeholderBotMessage]);

    const payload = new FormData();
    payload.append('text', input);
    if (selectedFile) {
      payload.append('file', selectedFile);
    }
    if (currentChatId) {
      payload.append('conversationId', currentChatId);
    }
    console.log(payload)

    try {
      let response = await fetch('http://localhost:5000/ai', {
        method: 'POST',
        credentials: 'include',
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok. status: ${response.status}`);
      }

      let data = await response.json();
      console.log('Response from AI:', data);

      // If it's a new conversation, add it to the chats list
      if (!currentChatId && data.conversationId) {
        setChats((prevChats) => [
          {
            id: data.conversationId,
            title: data.title || 'Scheduling Event',
            created_at: new Date().toISOString(),
          },
          ...prevChats,
        ]);
        setCurrentChatId(data.conversationId);
      }
      
      let botMessage = { sender: 'bot', text: data.message };

      let eventDetailsMatch = data.message.match(/Details:\s*(.*)$/);
      let newEventDetails = null;

      if (eventDetailsMatch && eventDetailsMatch[1]) {
        try {
          let newEventDetails = JSON.parse(eventDetailsMatch[1]);
          // Checks that all values in the json are strings. else retry response again
          let retries = 0;
          console.log('dog')
          for (let i = 0; i < 5; i++){
            let iKey = 0;
            let validJson = false;
            while(iKey < Object.keys(newEventDetails).length && Object.keys(newEventDetails).length == 9) {
              try {
                JSON.parse(newEventDetails[Object.keys(newEventDetails)[iKey]])
              } catch {
                if (iKey === Object.keys(newEventDetails).length-1){ 
                  console.log(`Correct event json with ${i} retries`);
                  validJson = true;
                }
                iKey += 1;
              }
            }
            if (validJson) break;
            let response = await fetch('http://localhost:5000/ai', {
              method: 'POST',
              credentials: 'include',
              body: payload,
            });
            if (!response.ok) {
              throw new Error(`Network response was not ok. status: ${response.status}`);
            }
            data = await response.json();
            eventDetailsMatch = data.message.match(/Details:\s*(.*)$/); 
            newEventDetails = JSON.parse(eventDetailsMatch[1])
            retries+=1;
          }
          if (retries == 5) console.error("Bot unable to format json event")
          const newEventId = Date.now();

          setEventDetails((prev) => [...prev, { ...newEventDetails, id: newEventId }]);
          setHandledEvents((prev) => ({ ...prev, [newEventId]: false }));

          botMessage = {
            sender: 'bot',
            text: 'Do you want to create the following event?',
            eventDetails: { ...newEventDetails, id: newEventId },
          };
        } catch (parseError) {
          console.error('Failed to parse event details:', parseError);
        }
      }

      // Replace the placeholder bot message with the actual bot message
      setMessages((prevMessages) => {
        const messagesCopy = [...prevMessages];
        messagesCopy[messagesCopy.length - 1] = botMessage;
        return messagesCopy;
      });
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { sender: 'bot', text: 'There was an error processing your request.' };
      setMessages((prevMessages) => {
        const messagesCopy = [...prevMessages];
        messagesCopy[messagesCopy.length - 1] = errorMessage;
        return messagesCopy;
      });
      showNotification('Failed to send message.');
    } finally {
      setIsLoading(false);
      setInput('');
      handleRemoveImage();
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
              <div
                className={`${styles.messageContent} ${
                  !msg.isLoading ? styles.fadereplace : ''
                }`}
              >
                {msg.isLoading ? (
                  <div style={{ width: '500px', margin: '0 auto' }}>
                    <LoadingBars />
                  </div>
                ) : (
                  <>
                    {msg.text}
                    {msg.image && (
                      <div className={styles.imageMessage}>
                        <img src={msg.image} alt="Attached" className={styles.imagePreview} />
                      </div>
                    )}
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <form 
          onSubmit={handleSendMessage} 
          className={`${styles.inputContainer} ${darkMode ? styles.inputContainerDark : ''}`}
        >
          <button
            className={`${styles.clip}`}
            type="button" 
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Paperclip className={styles.clipIcon} />
            <span className={`${styles.clipTip}`}>Attach file</span>
          </button>
          <input 
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{display: 'none'}}
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask Timewise AI..."
            className={`${styles.textarea} ${darkMode ? styles.textareaDark : ''}`}
            rows={1}
          />
          {selectedFile && (
            <div className={styles.attachedImageContainer}>
              <div className={styles.attachedImage}>
                {selectedFile.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="File Preview" 
                    className={styles.attachedImagePreview} 
                  />
                ) : (
                  <p>Unsupported file type. Please upload an image file.</p>
                )}
                <button 
                  className={styles.removeImageButton} 
                  onClick={() => handleRemoveImage()}
                  aria-label="Remove attached image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!input.trim()}
            className={`${styles.button} ${
              input.trim() || selectedFile ? (darkMode ? styles.buttonActiveDark : styles.buttonActive) : ''
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
          chatTitle={chats.find((c) => c.id === chatToDelete)?.title}
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
