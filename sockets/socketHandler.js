// server/socket/socketHandler.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const handleSocketConnection = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    try {
      // Set user online when they connect
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
        lastActive: new Date()
      });

      console.log(`User ${socket.user.name} is now online`);

      // Handle activity updates
      socket.on('updateStatus', async () => {
        try {
          await User.findByIdAndUpdate(userId, {
            lastActive: new Date()
          });
          console.log(`Updated activity for user ${socket.user.name}`);
        } catch (error) {
          console.error('Error updating user activity:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
            lastActive: new Date()
          });
          console.log(`User ${socket.user.name} is now offline`);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });
};