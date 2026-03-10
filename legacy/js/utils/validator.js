/**
 * Form Validation Utility
 * Uses validator library for comprehensive form validation
 */

const validator = require('validator');

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    return validator.isEmail(email || '');
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} locale - Locale (default: 'en-KE' for Kenya)
 * @returns {boolean} True if valid
 */
function isValidPhone(phone, locale = 'en-KE') {
    return validator.isMobilePhone(phone || '', locale, { strictMode: false });
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
    return validator.isURL(url || '');
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePassword(password, options = {}) {
    const errors = [];
    const minLength = options.minLength || 8;
    const requireUppercase = options.requireUppercase !== false;
    const requireLowercase = options.requireLowercase !== false;
    const requireNumbers = options.requireNumbers !== false;
    const requireSpecial = options.requireSpecial !== false;
    
    if (!password || password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (!input) return '';
    return validator.escape(input.toString());
}

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate and sanitize
 * @returns {object} { valid: boolean, email: string, error: string }
 */
function validateAndSanitizeEmail(email) {
    if (!email) {
        return { valid: false, email: '', error: 'Email is required' };
    }
    
    const sanitized = validator.normalizeEmail(email);
    
    if (!sanitized || !isValidEmail(sanitized)) {
        return { valid: false, email: '', error: 'Invalid email address' };
    }
    
    return { valid: true, email: sanitized, error: null };
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidUrl,
    validatePassword,
    sanitizeInput,
    validateAndSanitizeEmail
};

