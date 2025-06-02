import Chat from "../models/Chat.js";
import Message from '../models/Message.js';
import User from "../models/User.js";

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const senderId = req.user._id;

    // Fetch sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!sender.organizationId.equals(receiver.organizationId)) {
      return res.status(400).json({ 
        message: "You can't send a message outside the organization" 
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [senderId, userId], $size: 2 },
    }).populate('users', 'name email avatar isOnline');

    // If no chat, create a new one
    if (!chat) {
      chat = new Chat({
        users: [senderId, userId],
      });
      await chat.save();
      chat = await Chat.findById(chat._id).populate('users', 'name email avatar isOnline');
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserChats = async (req, res) => {
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

    // Get unread message counts for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: userId },
          messageStatus: { $ne: 'read' }
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.status(200).json(chatsWithUnread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name avatar')
      .populate('readBy.userId', 'name');

    res.json(messages.reverse()); // Reverse to get chronological order
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const searchUsers = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

export { accessChat, getUserChats, getMessages, searchUsers };