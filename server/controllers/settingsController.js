import Settings from '../models/Settings.js';
import fs from 'fs';
import path from 'path';

// Helper
const removeImage = (imagePath) => {
    if(!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if(fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = await Settings.create({});
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        const fields = req.body;
        
        // Handle Banner/Logo upload
        if (req.file) {
            // Assuming the field name was 'banner' or 'logo'. 
            // In route I used 'banner'. But model has 'logo'.
            // I should stick to 'logo' or make it dynamic if multiple files.
            // For now, let's assume route handles 'banner' but we save it as 'logo' or generic?
            // Actually, `settingsRoutes` had `upload.single('banner')`.
            // Let's assume user wants to update LOGO.
            
            if (settings.logo) removeImage(settings.logo);
            settings.logo = req.file.path.replace(/\\/g, '/');
        }

        // Update fields
        Object.keys(fields).forEach(key => {
            // Nested objects like socialMedia needs parsing if sent as string or direct object
            if (key === 'socialMedia' || key === 'seo') {
                if (typeof fields[key] === 'string') {
                    settings[key] = JSON.parse(fields[key]);
                } else {
                     settings[key] = fields[key]; // Assuming body parser handles nested
                }
            } else {
                settings[key] = fields[key];
            }
        });

        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
