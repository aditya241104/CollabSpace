import { useMemo } from 'react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

const ChatList = ({ chats, currentUser, selectedChat, onSelectChat, onlineUsers, loading }) => {
  const getOtherUser = (chat) => {
    return chat.users.find(user => user._id !== currentUser._id);
  };

  const getLastMessageTime = (chat) => {
    if (!chat.latestMessage) return '';
    
    const messageDate = new Date(chat.latestMessage.createdAt);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMM d');
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

const getMessageStatus = (msg) => {
  if (msg.senderId !== currentUser._id) return null;
  
  return (
    <div className="flex items-center ml-2">
      {msg.messageStatus === 'sending' && (
        <span className="text-gray-400 text-xs">Sending...</span>
      )}
      {msg.messageStatus === 'sent' && (
        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {msg.messageStatus === 'delivered' && (
        <div className="flex">
          <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 -ml-1 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {msg.messageStatus === 'read' && (
        <div className="flex">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 -ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.createdAt);
      const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.createdAt);
      return bTime - aTime;
    });
  }, [chats]);

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100%-80px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-[calc(100%-80px)]">
      {sortedChats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <div className="mb-2">💬</div>
          <p>No chats yet.</p>
          <p className="text-sm">Start a new conversation!</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sortedChats.map(chat => {
            const otherUser = getOtherUser(chat);
            const isSelected = selectedChat?._id === chat._id;
            const isOnline = onlineUsers.has(otherUser?._id);
            const hasUnread = (chat.unreadCount || 0) > 0;
            
            return (
              <li 
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`relative flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                {/* Online indicator */}
                <div className="relative mr-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {otherUser?.name || 'Unknown User'}
                    </h4>
                    <div className="flex items-center ml-2">
                      {chat.latestMessage && (
                        <>
                          {chat.latestMessage.senderId === currentUser._id && (
                            <span className={`text-xs mr-1 ${
                              chat.latestMessage.messageStatus === 'read' ? 'text-blue-500' : 'text-gray-400'
                            }`}>
                              {getMessageStatus(chat.latestMessage, chat.latestMessage.senderId, currentUser._id)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {getLastMessageTime(chat)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {chat.latestMessage ? (
                        <>
                          {chat.latestMessage.senderId === currentUser._id && (
                            <span className="text-gray-400">You: </span>
                          )}
                          {truncateMessage(chat.latestMessage.content)}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>
                    
                    {hasUnread && (
                      <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList;