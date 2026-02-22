import { PERMISSIONS } from '../models/User.js';
import asyncHandler from './asyncHandler.js';

/**
 * Middleware to check if user has required permission(s)
 * @param  {...string} requiredPermissions - Permissions required to access the route
 */
export const authorize = (...requiredPermissions) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
        required: requiredPermissions
      });
    }

    next();
  });
};

/**
 * Middleware to check if user has a specific role
 * @param  {...string} roles - Roles allowed to access the route
 */
export const requireRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        currentRole: user.role
      });
    }

    next();
  });
};

/**
 * Middleware to check if user is at least staff level
 */
export const isStaff = requireRole('staff', 'manager', 'admin', 'super_admin');

/**
 * Middleware to check if user is at least manager level
 */
export const isManager = requireRole('manager', 'admin', 'super_admin');

/**
 * Middleware to check if user is at least admin level
 */
export const isAdmin = requireRole('admin', 'super_admin');

/**
 * Middleware to check if user is super admin
 */
export const isSuperAdmin = requireRole('super_admin');

export { PERMISSIONS };
