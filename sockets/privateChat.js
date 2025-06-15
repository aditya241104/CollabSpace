import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { encryptMessage } from '../utils/crypto.js';

export const handlePrivateChat = (io) => {
  io.on('connection', (socket) => {
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, chatId, tempId } = data;
        const senderId = socket.userId;

        // Get sender's encryption key
        const sender = await User.findById(senderId);
        if (!sender || !sender.encryptionKey) {
          throw new Error('Sender encryption not configured');
        }

        // Encrypt the message
        const encryptedData = encryptMessage(content, sender.encryptionKey);

        // Save encrypted message
        const message = new Message({
          chatId,
          senderId,
          encryptedContent: encryptedData,
          messageType: 'text',
          messageStatus: 'sent'
        });
        
        await message.save();

        // Update chat's latest message
        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: message._id,
          updatedAt: new Date()
        });

        // Prepare message data for delivery
        const messageData = {
          _id: message._id,
          chatId,
          senderId,
          content, // Plain text for sender
          messageType: 'text',
          messageStatus: 'sent',
          createdAt: message.createdAt,
          tempId
        };

        // Deliver to receiver if online
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketId && receiver.encryptionKey) {
          try {
            // Receiver will decrypt on their side when fetching messages
            io.to(receiver.socketId).emit('receive-message', {
              ...messageData,
              messageStatus: 'delivered'
            });
            
            await Message.findByIdAndUpdate(message._id, {
              messageStatus: 'delivered'
            });
          } catch (error) {
            console.error('Error delivering message:', error);
          }
        }

        // Confirm to sender
        socket.emit('message-sent', messageData);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { 
          message: 'Failed to send message'
        });
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

        // Notify senders about read status
        const messages = await Message.find({ _id: { $in: messageIds } }).populate('senderId');
        
        messages.forEach(msg => {
          const sender = msg.senderId;
          if (sender && sender.socketId) {
            io.to(sender.socketId).emit('message-read', {
              messageId: msg._id,
              chatId: chatId,
              readBy: {
                userId,
                readAt: new Date()
              }
            });
          }
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user-typing', {
        chatId,
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user-typing', {
        chatId,
        userId: socket.userId,
        isTyping: false
      });
    });

    // Join/leave chat rooms
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
    });

    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });
  });
};