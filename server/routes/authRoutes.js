import express from 'express';
import { body } from 'express-validator';
import { 
    register, 
    login, 
    logout, 
    getMe, 
    refreshToken,
    logoutAll
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout-all', protect, logoutAll);

export default router;
