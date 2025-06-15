import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  // Only create new socket if none exists or previous one is disconnected
  if (!socket || socket.disconnected) {
    if (socket) socket.disconnect();

    socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

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

export const getSocket = () => socket;