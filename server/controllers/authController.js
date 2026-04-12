import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available. Please try again later.'
            });
        }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            lastLogin: new Date()
        });

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(
            req.get('User-Agent') || '',
            req.ip || ''
        );

        // Save user with refresh token
        await user.save();

        // Store refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    permissions: user.permissions
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        
        // Handle specific database errors
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return res.status(503).json({
                success: false,
                message: 'Database error. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        console.log('[Login Attempt] Body:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // 1. Find user
        const user = await User.findOne({ email }).select('+password');
        console.log('[Login] User search complete. Found:', !!user);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 2. Match password
        const isMatch = await user.matchPassword(password);
        console.log('[Login] Password match check:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 3. Status check
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is deactivated' });
        }

        // 4. Generate tokens
        console.log('[Login] Generating tokens...');
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(
            req.get('User-Agent') || '',
            req.ip || ''
        );

        // 5. Update last login
        console.log('[Login] Saving last login...');
        user.lastLogin = new Date();
        try {
            await user.save();
        } catch (saveError) {
            console.error('[Login] User save error (lastLogin update):', saveError);
            // Even if save fails, we can proceed if tokens are generated, 
            // but let's see if this is the cause.
            throw saveError;
        }

        // 6. Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    permissions: user.permissions
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('[Login Controller Error Details]:', error);
        res.status(500).json({ 
            success: false, 
            message: `Server Error: ${error.message}`,
            debugTrace: error.stack
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token cookie)
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            // Return 200 with success: false to avoid console errors for guests
            return res.status(200).json({ 
                success: false, 
                message: 'No refresh token provided' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is deactivated' 
            });
        }

        // Find valid refresh token in database
        const validToken = user.findValidRefreshToken(refreshToken);
        
        if (!validToken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired refresh token' 
            });
        }

        // Generate new access token
        const accessToken = user.generateAccessToken();

        // Generate new refresh token (token rotation)
        const newRefreshToken = user.generateRefreshToken(
            req.get('User-Agent') || '',
            req.ip || ''
        );

        // Revoke old refresh token
        user.revokeRefreshToken(refreshToken);
        
        try {
            await user.save();
        } catch (saveError) {
            // If it's a version error, it means another request already rotated the token
            // We can ignore it if the user was found and the token was valid initially
            if (saveError.name !== 'VersionError') {
                throw saveError;
            }
            console.log('Handled concurrent refresh token rotation (VersionError)');
        }

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        
        // Clear invalid refresh token cookie
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/'
        });
        
        res.status(401).json({ 
            success: false, 
            message: 'Invalid refresh token' 
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    permissions: user.permissions,
                    addresses: user.addresses,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                // Verify and find user
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user) {
                    // Revoke specific refresh token
                    user.revokeRefreshToken(refreshToken);
                    await user.save();
                }
            } catch (error) {
                console.error('Error revoking refresh token:', error);
            }
        }

        // Clear refresh token cookie
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during logout' 
        });
    }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Revoke all refresh tokens
        user.revokeAllRefreshTokens();
        await user.save();

        // Clear refresh token cookie
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/'
        });

        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during logout' 
        });
    }
};
