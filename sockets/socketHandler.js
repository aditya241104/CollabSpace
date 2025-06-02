import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const connectedUsers = new Map(); // userId -> socketId

export const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) return next(new Error('User not found'));

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
      // Store user connection
      connectedUsers.set(userId, socket.id);
      
      // Set user online
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
        lastActive: new Date()
      });

      // Notify organization members about online status
      const user = await User.findById(userId);
      socket.to(`org_${user.organizationId}`).emit('user-status-change', {
        userId,
        isOnline: true
      });

      // Join organization room
      socket.join(`org_${user.organizationId}`);

      console.log(`User ${userId} connected`);

      // Handle activity updates
      socket.on('user-active', async () => {
        try {
          await User.findByIdAndUpdate(userId, { lastActive: new Date() });
        } catch (error) {
          console.error('Error updating user activity:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
      try {
        connectedUsers.delete(userId);
        
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          socketId: null,
          lastActive: new Date()
        });

        // Notify organization members about offline status
        if (user && user.organizationId) {
          socket.to(`org_${user.organizationId}`).emit('user-status-change', {
            userId,
            isOnline: false
          });
        }

        console.log(`User ${userId} disconnected`);
      } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });

  return { connectedUsers };
};