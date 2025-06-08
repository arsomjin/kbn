/**
 * @typedef {Object} UserInfo
 * @property {string} [uid] - User ID
 * @property {string} [displayName] - Display name
 * @property {string} [fullName] - Full name
 * @property {string} [name] - Name
 * @property {string} [email] - Email address
 * @property {string} [department] - Department
 * @property {string} [role] - Role
 * @property {string} [accessLevel] - Access level
 * @property {string} [employeeCode] - Employee code
 * @property {string} [branchCode] - Branch code
 * @property {string} [provinceId] - Province ID
 */

/**
 * @typedef {Object} DocumentInfo
 * @property {string} [documentId] - Document ID
 * @property {string} [documentType] - Document type
 * @property {string} [documentNumber] - Document number
 * @property {number} [total] - Total amount
 * @property {string} [status] - Document status
 */

/**
 * @typedef {Object} GeographicContext
 * @property {string} [branchCode] - Branch code
 * @property {string} [provinceId] - Province ID
 * @property {string} [branchName] - Branch name
 * @property {string} [recordedProvince] - Recorded province
 * @property {string} [recordedBranch] - Recorded branch
 */

/**
 * @typedef {Object} AuditTrailEntry
 * @property {string} [id] - Entry ID
 * @property {string} uid - User ID
 * @property {number} time - Timestamp
 * @property {number} [timestamp] - Alternative timestamp
 * @property {'create'|'update'|'delete'|'approve'|'reject'|'submit'|'cancel'} action - Action type
 * @property {number|null} [step] - Step number
 * @property {Object} [changes] - Changes made
 * @property {UserInfo} userInfo - User information
 * @property {DocumentInfo} [documentInfo] - Document information
 * @property {GeographicContext} [geographic] - Geographic context
 * @property {string} [notes] - Notes
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} StatusHistoryEntry
 * @property {string} [id] - Entry ID
 * @property {string} status - Status value
 * @property {number} time - Timestamp
 * @property {number} [timestamp] - Alternative timestamp
 * @property {string} uid - User ID
 * @property {UserInfo} userInfo - User information
 * @property {string} [comment] - Comment
 * @property {string} [notes] - Notes
 * @property {GeographicContext} [geographic] - Geographic context
 * @property {string} [documentId] - Document ID
 * @property {string} [documentType] - Document type
 */

/**
 * @typedef {Object} ChangeHistoryEntry
 * @property {string} [id] - Entry ID
 * @property {string} documentId - Document ID
 * @property {string} documentType - Document type
 * @property {'created'|'edited'|'approved'|'rejected'|'submitted'|'cancelled'} type - Change type
 * @property {string} changedBy - User who made the change
 * @property {number} timestamp - Timestamp
 * @property {ChangeDetail[]} changes - Array of changes
 * @property {string} [notes] - Notes
 * @property {Object} [oldValues] - Old values
 * @property {Object} [newValues] - New values
 * @property {GeographicContext} [geographic] - Geographic context
 */

/**
 * @typedef {Object} ChangeDetail
 * @property {string} field - Field name
 * @property {*} oldValue - Old value
 * @property {*} newValue - New value
 * @property {'field_change'|'array_change'|'object_change'} [type] - Change type
 * @property {*} [details] - Additional details
 */

/**
 * @typedef {Object} AuditStep
 * @property {string} title - Step title
 * @property {string} [description] - Step description
 * @property {boolean} [required] - Is step required
 * @property {string[]} [permissions] - Required permissions
 * @property {boolean} [error] - Has error
 */

/**
 * @typedef {Object} AuditTrailConfig
 * @property {boolean} [showChangeHistory] - Show change history
 * @property {boolean} [showAuditDetails] - Show audit details
 * @property {boolean} [showGeographicInfo] - Show geographic info
 * @property {boolean} [allowManualApproval] - Allow manual approval
 * @property {string[]} [requiredPermissions] - Required permissions
 * @property {string[]} [excludeFields] - Fields to exclude from tracking
 */

// Export placeholder for JSDoc types (not needed in runtime)
export const AuditTrailTypes = {}; 