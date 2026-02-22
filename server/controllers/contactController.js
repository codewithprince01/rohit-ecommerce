import ContactMessage from '../models/ContactMessage.js';

// @desc    Submit new contact message
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contact = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json({ success: true, data: contact });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
    try {
        const messages = await ContactMessage.find({}).sort('-createdAt');
        res.json({ success: true, count: messages.length, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (message) {
            await message.deleteOne();
            res.json({ success: true, message: 'Message removed' });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};
