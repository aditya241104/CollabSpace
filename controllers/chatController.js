import Chat from "../models/Chat.js";
import Message from '../models/Message.js';
import User from "../models/User.js";
import { decryptMessage } from "../utils/crypto.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const senderId = req.user._id;

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [senderId, userId], $size: 2 },
    }).populate('users', 'name email avatar isOnline');

    if (!chat) {
      chat = new Chat({
        users: [senderId, userId],
      });
      await chat.save();
      chat = await Chat.findById(chat._id).populate('users', 'name email avatar isOnline');
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Error accessing chat:', err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: userId } }
    })
    .populate('users', 'name avatar email isOnline lastActive')
    .populate({
      path: 'latestMessage',
      populate: {
        path: 'senderId',
        select: 'name'
      }
    })
    .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error('Error getting user chats:', err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name avatar')
      .populate('readBy.userId', 'name');

    // Get user's encryption key
    const user = await User.findById(userId);
    const secretKey = user.encryptionKey;

    const decryptedMessages = messages.map(message => {
      if (message.encryptedContent && secretKey) {
        try {
          const decryptedContent = decryptMessage(message.encryptedContent, secretKey);
          return {
            ...message.toObject(),
            content: decryptedContent,
            encryptedContent: undefined
          };
        } catch (error) {
          console.error('Decryption failed:', error);
          return {
            ...message.toObject(),
            content: '[Encrypted message]',
            isEncrypted: true
          };
        }
      }
      return message.toObject();
    });

    res.json(decryptedMessages.reverse());
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;
    
    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      organizationId: req.user.organizationId,
      _id: { $ne: currentUserId }
    })
    .select('name email avatar isOnline lastActive')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};