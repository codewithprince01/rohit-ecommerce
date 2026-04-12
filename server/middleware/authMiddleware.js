import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        // Verify access token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
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

        // Check if password changed after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                success: false,
                message: 'Password changed recently, please login again'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
            return res.status(401).json({
                success: false,
                message: 'Your session has expired or is invalid. Please login again.'
            });
        }
        
        // Handle Mongoose cast errors in token IDs
        if (error.name === 'CastError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid session data. Please login again.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: `Authentication failed: ${error.message}`
        });
    }
};

export const authorize = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has required permissions
        const hasPermission = permissions.every(permission => 
            req.user.permissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                required: permissions
            });
        }

        next();
    };
};

export const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isAdminLevel()) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

export const superAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Super admin access required'
        });
    }

    next();
};

// Optional auth - doesn't fail if no token, just continues without user
export const optionalAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid, continue without user
            req.user = null;
        }
    }

    next();
};

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // If user is admin, allow access
        if (req.user.isAdminLevel()) {
            return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.params[resourceField] || req.body[resourceField];
        
        if (req.user._id.toString() !== resourceUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources'
            });
        }

        next();
    };
};
