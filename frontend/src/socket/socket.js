import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost:3000', {
    auth: {
      token: token
    },
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Connected to server - User is now online');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server - User is now offline');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitStatusUpdate = () => {
  if (socket && socket.connected) {
    socket.emit('updateStatus');
  }
};