import { useState, useEffect, useRef, useCallback } from 'react';
import { connectSocket } from '../../socket/socket.js';
import axiosClient from '../../utils/axiosClient';
import ChatList from './ChatComponents/ChatList';
import ChatWindow from './ChatComponents/ChatWindow';
import SearchUsers from './ChatComponents/SearchUsers';

const Chat = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Memoized function to update chat latest message
  const updateChatLatestMessage = useCallback((message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat._id === message.chatId) {
          const isCurrentChat = chat._id === selectedChat?._id;
          const newUnreadCount = isCurrentChat ? 0 : (chat.unreadCount || 0) + 1;
          return { 
            ...chat, 
            latestMessage: message, 
            unreadCount: newUnreadCount,
            updatedAt: message.createdAt
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    );
  }, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = connectSocket(token);
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error. Trying to reconnect...');
    });

    socket.on('receive-message', (message) => {
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages(prev => {
          if (prev.some(msg => msg._id === message._id)) return prev;
          return [...prev, { ...message, messageStatus: 'delivered' }];
        });

        socket.emit('mark-as-read', {
          chatId: message.chatId,
          messageIds: [message._id]
        });
      }
      updateChatLatestMessage({ ...message, messageStatus: 'delivered' });
    });

    socket.on('message-sent', (message) => {
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.tempId === message.tempId);
          if (existingIndex >= 0) {
            const updatedMessage = {
              ...message,
              messageStatus: message.messageStatus || 'sent'
            };
            const newMessages = [...prev];
            newMessages[existingIndex] = updatedMessage;
            return newMessages;
          }
          return [...prev, message];
        });
      }
      updateChatLatestMessage(message);
    });

    socket.on('initial-online-users', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser, selectedChat, updateChatLatestMessage]);

  // Fetch user's chats
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchChats = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get('/chat/user-chats');
        console.log("sortedchats", response);
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }

        const sortedChats = [...response.data].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setChats(sortedChats);
        setError(null);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError(error.response?.data?.message || 'Failed to load chats');
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

  const fetchMessages = async () => {
  setLoading(true);
  try {
    const response = await axiosClient.get(`/chat/messages/${selectedChat._id}`, {
      data: { password: currentUser.password } // Send password in the request body
    });
    setMessages(response.data);
    
    socketRef.current?.emit('join-chat', selectedChat._id);
    
    const unreadMessages = response.data
      .filter(msg => msg.senderId !== currentUser._id && msg.messageStatus !== 'read')
      .map(msg => msg._id);
      
    if (unreadMessages.length > 0) {
      socketRef.current?.emit('mark-as-read', {
        chatId: selectedChat._id,
        messageIds: unreadMessages
      });
    }

    setChats(prev => prev.map(chat => 
      chat._id === selectedChat._id ? { ...chat, unreadCount: 0 } : chat
    ));

    setError(null);
  } catch (error) {
    console.error('Error fetching messages:', error);
    setError('Failed to load messages');
  } finally {
    setLoading(false);
  }
};

    fetchMessages();
    
    return () => {
      if (selectedChat) {
        socketRef.current?.emit('leave-chat', selectedChat._id);
      }
    };
  }, [selectedChat, currentUser]);

  const handleSendMessage = useCallback(async (content) => {
    if (!selectedChat || !content.trim() || !socketRef.current) return;

    const receiverId = selectedChat.users.find(user => user._id !== currentUser._id)?._id;
    if (!receiverId) return;

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      tempId: `temp_${Date.now()}`,
      content: content.trim(),
      senderId: currentUser._id,
      chatId: selectedChat._id,
      createdAt: new Date().toISOString(),
      messageStatus: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);

    socketRef.current.emit('send-message', {
      receiverId,
      content: content.trim(),
      chatId: selectedChat._id,
      tempId: tempMessage.tempId
    });
  }, [selectedChat, currentUser]);

  const handleTypingStart = useCallback(() => {
    if (!selectedChat || !socketRef.current) return;
    
    socketRef.current.emit('typing-start', { 
      chatId: selectedChat._id,
      userName: currentUser.name 
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing-stop', { chatId: selectedChat._id });
    }, 2000);
  }, [selectedChat, currentUser]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get(`/chat/search-users?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      setError(null);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewChat = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await axiosClient.post('/chat/access-chat', { userId });
      const newChat = { ...response.data, unreadCount: 0 };
      
      setSelectedChat(newChat);
      setChats(prev => {
        const exists = prev.some(chat => chat._id === newChat._id);
        return exists ? prev : [newChat, ...prev];
      });
      setShowSearch(false);
      setError(null);
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError('Failed to start new chat');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChatSelect = useCallback((chat) => {
    setSelectedChat(chat);
    setShowSearch(false);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-sm z-50">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className={`${showSearch ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 bg-white border-r ${error ? 'mt-10' : ''}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <button 
            onClick={() => setShowSearch(true)}
            disabled={loading}
            className="mt-2 w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-md transition"
          >
            {loading ? 'Loading...' : 'New Chat'}
          </button>
        </div>
        <ChatList 
          chats={chats} 
          currentUser={currentUser} 
          selectedChat={selectedChat}
          onSelectChat={handleChatSelect}
          onlineUsers={onlineUsers}
          loading={loading}
        />
      </div>

      <div className={`${showSearch ? 'block' : 'hidden md:block'} flex-1 flex flex-col ${error ? 'mt-10' : ''}`}>
        {showSearch ? (
          <SearchUsers 
            onSearch={handleSearch}
            searchResults={searchResults}
            onStartChat={startNewChat}
            onBack={() => setShowSearch(false)}
            onlineUsers={onlineUsers}
            loading={loading}
          />
        ) : selectedChat ? (
          <ChatWindow 
            chat={selectedChat}
            messages={messages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            typingUsers={typingUsers}
            onlineUsers={onlineUsers}
            loading={loading}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No chat selected</h3>
              <p className="text-gray-500 mb-4">Select an existing chat or start a new conversation</p>
              <button
                onClick={() => setShowSearch(true)}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-md transition"
              >
                {loading ? 'Loading...' : 'Start New Chat'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;