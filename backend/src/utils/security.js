/**
 * Security utilities for input sanitization and validation
 */

/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} str - User input string
 * @returns {string} - Escaped string safe for regex
 */
export const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize URL for logging (prevent log injection)
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/[\n\r\t]/g, '');
};

/**
 * Validate pagination parameters with bounds
 * @param {number} page - Page number from query
 * @param {number} limit - Items per page from query
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {object} - Validated { page, limit, skip }
 */
export const validatePagination = (page, limit, maxLimit = 100) => {
  let validPage = parseInt(page, 10) || 1;
  let validLimit = parseInt(limit, 10) || 10;

  // Enforce bounds
  validPage = Math.max(1, validPage);
  validLimit = Math.max(1, Math.min(validLimit, maxLimit));

  const skip = (validPage - 1) * validLimit;

  return { page: validPage, limit: validLimit, skip };
};

/**
 * Whitelist allowed fields for mass assignment protection
 * @param {object} data - User provided data
 * @param {string[]} allowedFields - Array of allowed field names
 * @returns {object} - Filtered object with only allowed fields
 */
export const filterAllowedFields = (data, allowedFields) => {
  const filtered = {};
  allowedFields.forEach(field => {
    if (field in data) {
      filtered[field] = data[field];
    }
  });
  return filtered;
};

/**
 * Valid application status transitions
 */
export const VALID_STATUS_TRANSITIONS = {
  'submitted': ['under-review', 'rejected'],
  'under-review': ['shortlisted', 'rejected'],
  'shortlisted': ['interview', 'rejected'],
  'interview': ['offered', 'rejected'],
  'offered': ['accepted', 'rejected'],
  'accepted': [],
  'rejected': []
};

/**
 * Validate status transition
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - Proposed new status
 * @returns {boolean} - Whether transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
};