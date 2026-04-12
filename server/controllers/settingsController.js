import Settings from '../models/Settings.js';
import fs from 'fs';
import path from 'path';

// Helper
const removeImage = (imagePath) => {
    if(!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if(fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (err) {
            console.error(`Failed to delete old image ${imagePath}:`, err.message);
        }
    }
}

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
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
        
        // Handle Logo & Favicon uploads if available
        if (req.files) {
            if (req.files.logo) {
                if (settings.logo) removeImage(settings.logo);
                settings.logo = req.files.logo[0].path.replace(/\\/g, '/');
            }
            if (req.files.favicon) {
                if (settings.favicon) removeImage(settings.favicon);
                settings.favicon = req.files.favicon[0].path.replace(/\\/g, '/');
            }
        }

        // Update other fields
        Object.keys(fields).forEach(key => {
            // Handle objects like socialMedia and seo
            if (key === 'socialMedia' || key === 'seo') {
                try {
                    const parsed = typeof fields[key] === 'string' ? JSON.parse(fields[key]) : fields[key];
                    settings[key] = { ...settings[key], ...parsed };
                } catch (e) {
                    console.error(`Error parsing ${key}:`, e.message);
                }
            } else if (key !== 'logo' && key !== 'favicon') {
                settings[key] = fields[key];
            }
        });

        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
