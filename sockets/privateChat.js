import jwt from 'jsonwebtoken';
import Chat from "../models/Chat.js";
import Message from '../models/Message.js';
import User from "../models/User.js";

const typingUsers = new Map(); // chatId -> Set of userIds

export const handlePrivateChat = (io, connectedUsers) => {
  io.on('connection', (socket) => {
    
    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, chatId } = data;
        const senderId = socket.userId;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        if (!sender.organizationId.equals(receiver.organizationId)) {
          socket.emit('error', { message: 'Cannot send message outside organization' });
          return;
        }

        let chat = await Chat.findOne({
          isGroupChat: false,
          users: { $all: [senderId, receiverId], $size: 2 },
        });

        if (!chat) {
          chat = new Chat({
            users: [senderId, receiverId],
          });
          await chat.save();
        }

        const message = new Message({
          chatId: chat._id,
          senderId: senderId,
          content: content,
          messageType: 'text',
          messageStatus: 'sent'
        });
        await message.save();

        chat.latestMessage = message._id;
        await chat.save();

        const messageData = {
          _id: message._id,
          chatId: chat._id,
          senderId: senderId,
          content: content,
          messageType: 'text',
          messageStatus: 'sent',
          createdAt: message.createdAt,
        };

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', {
            ...messageData,
            messageStatus: 'delivered'
          });
          
          // Update message status to delivered
          await Message.findByIdAndUpdate(message._id, { messageStatus: 'delivered' });
        }

        // Confirm to sender
        socket.emit('message-sent', messageData);

      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Server error' });
      }
    });

    // Mark messages as read
    socket.on('mark-as-read', async (data) => {
      try {
        const { chatId, messageIds } = data;
        const userId = socket.userId;

        await Message.updateMany(
          { _id: { $in: messageIds }, senderId: { $ne: userId } },
          { 
            messageStatus: 'read',
            $addToSet: { readBy: { userId: userId, readAt: new Date() } }
          }
        );

        // Notify sender about read status
        const messages = await Message.find({ _id: { $in: messageIds } }).populate('senderId');
        
        messages.forEach(msg => {
          const senderSocketId = connectedUsers.get(msg.senderId._id.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-read', {
              messageId: msg._id,
              chatId: chatId,
              readBy: userId
            });
          }
        });

      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Error marking messages as read' });
      }
    });

    // Typing indicator
  socket.on('typing-start', (data) => {
    try {
      const { chatId } = data;
      const userId = socket.userId;
      const userName = socket.user.name; // Add this line

      if (!typingUsers.has(chatId)) {
        typingUsers.set(chatId, new Set());
      }
      typingUsers.get(chatId).add({ userId, userName }); // Modified this line

      socket.to(chatId).emit('user-typing', {
        chatId,
        userId,
        userName, // Add this line
        isTyping: true
      });
    } catch (err) {
      console.error(err);
    }
  });

socket.on('typing-stop', (data) => {
  try {
    const { chatId } = data;
    const userId = socket.userId;

    if (typingUsers.has(chatId)) {
      typingUsers.get(chatId).delete(userId);
    }

    socket.to(chatId).emit('user-typing', {
      chatId,
      userId,
      isTyping: false
    });
  } catch (err) {
    console.error(err);
  }
});

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

  });
};