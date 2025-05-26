import {updatePassword,updateOrgRole,getUserDetails} from "../controllers/userController.js";
import express from 'express';
const router = express.Router();
router.post('/updatePassword',updatePassword);
router.post('/updateorgrole',updateOrgRole);
router.get("/:userId", getUserDetails);
export default router;
