import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getSettings)
    .put(protect, admin, upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 }
    ]), updateSettings);

export default router;
