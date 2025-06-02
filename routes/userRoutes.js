import {updatePassword,updateOrgRole,getUserDetails,searchUsers,getUserChats} from "../controllers/userController.js";
import verifyToken from "../middlewares/authMiddleware.js";

import express from 'express';
const router = express.Router();
router.post('/updatePassword',verifyToken,updatePassword);
router.post('/updateorgrole',verifyToken,updateOrgRole);
router.get("/:userId",verifyToken, getUserDetails);
router.get('/search/:query', verifyToken, searchUsers);
export default router;
