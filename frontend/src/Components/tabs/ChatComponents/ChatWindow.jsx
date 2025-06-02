import { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ 
  chat, 
  messages, 
  currentUser, 
  onSendMessage, 
  onTypingStart, 
  typingUsers, 
  onlineUsers, 
  loading 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUser = chat.users.find(user => user._id !== currentUser._id);
  const isOtherUserOnline = onlineUsers.has(otherUser?._id);
  const typingUsersList = Array.from(typingUsers.values());

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [chat._id, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    onSendMessage(message);
    setMessage('');
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }
  };

  const formatMessageTime = (createdAt) => {
    const messageDate = new Date(createdAt);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, h:mm a');
    }
  };

  const getMessageStatus = (msg) => {
    if (msg.senderId !== currentUser._id) return null;
    
    switch (msg.messageStatus) {
      case 'sending':
        return <span className="text-gray-400">○</span>;
      case 'sent':
        return <span className="text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-blue-300">✓✓</span>;
      case 'read':
        return <span className="text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    
    return currentDate !== prevDate;
  };

  const renderDateSeparator = (date) => {
    const messageDate = new Date(date);
    let dateText;
    
    if (isToday(messageDate)) {
      dateText = 'Today';
    } else if (isYesterday(messageDate)) {
      dateText = 'Yesterday';
    } else {
      dateText = format(messageDate, 'MMMM d, yyyy');
    }
    
    return (
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
          {dateText}
        </div>
      </div>
    );
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            {isOtherUserOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{otherUser?.name || 'Unknown User'}</h3>
            <p className="text-xs text-gray-500">
              {isOtherUserOnline ? (
                <span className="text-green-600">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const prevMsg = messages[index - 1];
              const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);
            

            let isOwn = false;
            if (typeof msg.senderId === 'object' && msg.senderId !== null) {
              isOwn = msg.senderId._id === currentUser._id;
            } else {
              isOwn = msg.senderId === currentUser._id;
            }            console.log(isOwn);
              const showAvatar = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId);
              const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId && 
                !shouldShowDateSeparator(msg, prevMsg);
              
              return (
                <div key={msg._id || msg.tempId}>
                  {showDateSeparator && renderDateSeparator(msg.createdAt)}
                  
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-3'}`}>
                    {!isOwn && showAvatar && (
                      <div className="flex-shrink-0 mr-2 self-end">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    } ${msg.messageStatus === 'sending' ? 'opacity-80' : ''}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <span className="text-xs">
                            {getMessageStatus(msg)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUsersList.length > 0 && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 mr-2 flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-tl-none px-4 py-2">
                  <TypingIndicator users={typingUsersList} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[40px] max-h-[120px]"
              rows="1"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </form>
        
        {isTyping && (
          <div className="text-xs text-gray-400 mt-1">
            Typing...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;