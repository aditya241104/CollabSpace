import { 
  accessChat, 
  getUserChats, 
  getMessages, 
  searchUsers 
} from "../controllers/chatController.js";
import express from 'express';
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/access-chat', verifyToken, accessChat);
router.get('/user-chats', verifyToken, getUserChats);
router.get('/messages/:chatId', verifyToken, getMessages);
router.get('/search-users', verifyToken, searchUsers);

export default router;