import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';



// Define permissions for RBAC

const PERMISSIONS = {

  // Dashboard

  VIEW_DASHBOARD: 'view_dashboard',

  VIEW_ANALYTICS: 'view_analytics',

  

  // Products

  CREATE_PRODUCT: 'create_product',

  READ_PRODUCT: 'read_product',

  UPDATE_PRODUCT: 'update_product',

  DELETE_PRODUCT: 'delete_product',

  

  // Categories

  CREATE_CATEGORY: 'create_category',

  READ_CATEGORY: 'read_category',

  UPDATE_CATEGORY: 'update_category',

  DELETE_CATEGORY: 'delete_category',

  

  // Orders

  CREATE_ORDER: 'create_order',

  READ_ORDER: 'read_order',

  UPDATE_ORDER: 'update_order',

  DELETE_ORDER: 'delete_order',

  PROCESS_REFUND: 'process_refund',

  

  // Users

  CREATE_USER: 'create_user',

  READ_USER: 'read_user',

  UPDATE_USER: 'update_user',

  DELETE_USER: 'delete_user',

  

  // Settings

  MANAGE_SETTINGS: 'manage_settings',

  MANAGE_ROLES: 'manage_roles',

  

  // Inventory

  MANAGE_INVENTORY: 'manage_inventory',

  VIEW_STOCK_ALERTS: 'view_stock_alerts',

  

  // Reports

  VIEW_REPORTS: 'view_reports',

  EXPORT_DATA: 'export_data',

};



// Role-based permission mapping

const ROLE_PERMISSIONS = {

  super_admin: Object.values(PERMISSIONS), // All permissions

  admin: [

    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.VIEW_ANALYTICS,

    PERMISSIONS.CREATE_PRODUCT, PERMISSIONS.READ_PRODUCT, PERMISSIONS.UPDATE_PRODUCT, PERMISSIONS.DELETE_PRODUCT,

    PERMISSIONS.CREATE_CATEGORY, PERMISSIONS.READ_CATEGORY, PERMISSIONS.UPDATE_CATEGORY, PERMISSIONS.DELETE_CATEGORY,

    PERMISSIONS.CREATE_ORDER, PERMISSIONS.READ_ORDER, PERMISSIONS.UPDATE_ORDER, PERMISSIONS.DELETE_ORDER, PERMISSIONS.PROCESS_REFUND,

    PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER,

    PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.VIEW_STOCK_ALERTS,

    PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_DATA,

  ],

  manager: [

    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.CREATE_PRODUCT, PERMISSIONS.READ_PRODUCT, PERMISSIONS.UPDATE_PRODUCT,

    PERMISSIONS.READ_CATEGORY,

    PERMISSIONS.READ_ORDER, PERMISSIONS.UPDATE_ORDER,

    PERMISSIONS.READ_USER,

    PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.VIEW_STOCK_ALERTS,

    PERMISSIONS.VIEW_REPORTS,

  ],

  staff: [

    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.READ_PRODUCT,

    PERMISSIONS.READ_CATEGORY,

    PERMISSIONS.READ_ORDER, PERMISSIONS.UPDATE_ORDER,

    PERMISSIONS.VIEW_STOCK_ALERTS,

  ],

  user: [], // Regular customers - no admin permissions

};



const userSchema = new mongoose.Schema({

  name: {

    type: String,

    required: [true, 'Please provide a name'],

    trim: true,

    maxlength: [50, 'Name cannot be more than 50 characters']

  },

  email: {

    type: String,

    required: [true, 'Please provide an email'],

    unique: true,

    lowercase: true,

    trim: true,

    match: [

      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,

      'Please provide a valid email'

    ]

  },

  password: {

    type: String,

    required: [true, 'Please provide a password'],

    minlength: [6, 'Password must be at least 6 characters'],

    select: false

  },

  phone: {

    type: String,

    trim: true,

  },

  avatar: {

    type: String,

    default: null

  },

  role: {

    type: String,

    enum: ['user', 'staff', 'manager', 'admin', 'super_admin'],

    default: 'user'

  },

  // Custom permissions (overrides role-based)

  customPermissions: [{

    type: String,

    enum: Object.values(PERMISSIONS)

  }],

  isActive: {

    type: Boolean,

    default: true

  },

  lastLogin: {

    type: Date,

    default: null

  },

  refreshToken: {

    type: String,

    select: false

  },

  passwordChangedAt: Date,

  passwordResetToken: String,

  passwordResetExpires: Date,

  // Address for customers

  addresses: [{

    label: { type: String, default: 'Home' },

    addressLine1: String,

    addressLine2: String,

    city: String,

    state: String,

    pincode: String,

    country: { type: String, default: 'India' },

    isDefault: { type: Boolean, default: false }

  }]

}, {

  timestamps: true,

  toJSON: { virtuals: true },

  toObject: { virtuals: true }

});



// Virtual for permissions (combines role permissions + custom)

userSchema.virtual('permissions').get(function() {

  const rolePerms = ROLE_PERMISSIONS[this.role] || [];

  const customPerms = this.customPermissions || [];

  return [...new Set([...rolePerms, ...customPerms])];

});



// Hash password before saving

userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) {

    return next();

  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  this.passwordChangedAt = Date.now() - 1000; // Ensure token issued after password change

  next();

});



// Match password method

userSchema.methods.matchPassword = async function(enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);

};



// Check if password changed after token was issued

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {

  if (this.passwordChangedAt) {

    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;

  }

  return false;

};



// Check if user has a specific permission

userSchema.methods.hasPermission = function(permission) {

  return this.permissions.includes(permission);

};



// Check if user has any of the specified permissions

userSchema.methods.hasAnyPermission = function(permissions) {

  return permissions.some(p => this.permissions.includes(p));

};



// Check if user is admin level

userSchema.methods.isAdminLevel = function() {

  return ['staff', 'manager', 'admin', 'super_admin'].includes(this.role);

};



// Generate access token

userSchema.methods.generateAccessToken = function() {

  return jwt.sign(

    { 

      id: this._id, 

      role: this.role,

      permissions: this.permissions 

    },

    process.env.JWT_ACCESS_SECRET,

    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }

  );

};



// Generate refresh token

userSchema.methods.generateRefreshToken = function() {

  return jwt.sign(

    { id: this._id },

    process.env.JWT_REFRESH_SECRET,

    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }

  );

};



// Indexes

userSchema.index({ role: 1 });

userSchema.index({ isActive: 1 });



const User = mongoose.model('User', userSchema);



export { PERMISSIONS, ROLE_PERMISSIONS };

export default User;

