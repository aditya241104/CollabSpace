import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Notification = ({ message, type }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border border-green-200 text-green-700',
    error: 'bg-red-50 border border-red-200 text-red-700'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={`mb-6 px-4 py-3 rounded-lg flex items-center space-x-2 ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

export default Notification;