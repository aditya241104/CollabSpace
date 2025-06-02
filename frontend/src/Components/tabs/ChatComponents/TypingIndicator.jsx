import { useState, useEffect } from 'react';

const TypingIndicator = ({ users = [] }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getTypingText = () => {
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0].userName} is typing${dots}`;
    if (users.length === 2) return `${users[0].userName} and ${users[1].userName} are typing${dots}`;
    return `${users[0].userName} and ${users.length - 1} others are typing${dots}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-600 text-sm">{getTypingText()}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;