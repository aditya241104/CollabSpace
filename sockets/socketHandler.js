import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    try {
      // Update user's online status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
        lastActive: new Date()
      });

      console.log(`User ${userId} connected`);

      // Join organization room if exists
      const user = await User.findById(userId);
      if (user.organizationId) {
        socket.join(`org_${user.organizationId}`);
        
        // Notify organization members
        socket.to(`org_${user.organizationId}`).emit('user-status-change', {
          userId,
          isOnline: true
        });
      }

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`User ${userId} disconnected`);
        
        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
            lastActive: new Date()
          });

          if (user && user.organizationId) {
            socket.to(`org_${user.organizationId}`).emit('user-status-change', {
              userId,
              isOnline: false
            });
          }
        } catch (error) {
          console.error('Error updating user offline status:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });
};