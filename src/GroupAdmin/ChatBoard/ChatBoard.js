import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBoard.css';
import notificationSound from '../../assets/notification.wav';

const ChatBoard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you?', sender: 'admin' },
    { id: 2, text: 'Welcome to our support chat', sender: 'admin' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(notificationSound);
      audio.play()
        // .then(() => console.log("Notification sound played"))
        .catch(e => console.warn("Audio play failed:", e));
    } catch (e) {
      console.error("Audio initialization error:", e);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;
  
    const userMessage = { id: Date.now(), text: trimmedMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
  
    try {
      const encodedQuery = encodeURIComponent(trimmedMessage);
      const url = `http://34.93.86.68:8000/query?query=${encodedQuery}`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.response || "I'm not sure how to respond.",
          sender: 'admin'
        }
      ]);
    } catch (error) {
      console.error('API call error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Sorry, something went wrong. Please try again.',
          sender: 'admin'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      
     
      if (lastMessage.sender === 'admin' && isOpen || !isOpen) {
        playNotificationSound();
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isOpen, playNotificationSound]);

  return (
    <div className="chat-container">
      <div className={`chat-icon ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>

      <div className={`chat-box ${isOpen ? 'open' : ''}`}>
        <div className="chat-header" onClick={toggleChat}>
          <h3>Support Chat</h3>
          <div className="close-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'admin' ? 'admin-message' : 'user-message'}`}
            >
              {message.text}
            </div>
          ))}

          {isLoading && (
            <div className="message admin-message">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBoard;