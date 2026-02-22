import mongoose from 'mongoose';

const ACTION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  BULK_UPDATE: 'bulk_update',
  STATUS_CHANGE: 'status_change',
  PERMISSION_CHANGE: 'permission_change',
  SETTINGS_CHANGE: 'settings_change',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  REFUND: 'refund'
};

const RESOURCE_TYPES = {
  USER: 'user',
  PRODUCT: 'product',
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  SUB_SUBCATEGORY: 'sub_subcategory',
  ORDER: 'order',
  SETTINGS: 'settings',
  COUPON: 'coupon',
  INVENTORY: 'inventory',
  REPORT: 'report'
};

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  userEmail: String,
  userRole: String,
  
  // What action was performed
  action: {
    type: String,
    enum: Object.values(ACTION_TYPES),
    required: true
  },
  
  // On what resource
  resourceType: {
    type: String,
    enum: Object.values(RESOURCE_TYPES),
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  resourceName: String,
  
  // Change details
  previousData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  changedFields: [String],
  
  // Additional context
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request info
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestUrl: String,
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Static method to create an audit log
auditLogSchema.statics.log = async function({
  user,
  action,
  resourceType,
  resourceId,
  resourceName,
  previousData,
  newData,
  description,
  metadata,
  ipAddress,
  userAgent,
  requestMethod,
  requestUrl,
  status = 'success',
  errorMessage
}) {
  try {
    // Calculate changed fields if both previous and new data exist
    let changedFields = [];
    if (previousData && newData && typeof previousData === 'object' && typeof newData === 'object') {
      const allKeys = new Set([...Object.keys(previousData), ...Object.keys(newData)]);
      changedFields = [...allKeys].filter(key => {
        return JSON.stringify(previousData[key]) !== JSON.stringify(newData[key]);
      });
    }
    
    const log = await this.create({
      user: user._id || user,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      resourceType,
      resourceId,
      resourceName,
      previousData,
      newData,
      changedFields,
      description,
      metadata,
      ipAddress,
      userAgent,
      requestMethod,
      requestUrl,
      status,
      errorMessage
    });
    
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't break the main operation
    return null;
  }
};

// Indexes for efficient querying
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ 'metadata.orderId': 1 });

// TTL index - automatically delete logs older than 1 year (configurable)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { ACTION_TYPES, RESOURCE_TYPES };
export default AuditLog;
