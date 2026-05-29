import express from 'express';
import { register, login, logout, getMe, refreshToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/me').get(protect, getMe);
router.route('/refresh').post(refreshToken);

export default router;
