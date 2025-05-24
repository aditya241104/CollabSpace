import {updatePassword,updateOrgRole} from "../controllers/userController.js";
import express from 'express';
const router = express.Router();
router.post('/updatePassword',updatePassword);
router.post('/updateorgrole',updateOrgRole);
export default router;
