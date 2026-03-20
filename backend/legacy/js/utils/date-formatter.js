/**
 * Date Formatter Utility
 * Uses date-fns for consistent date formatting across the application
 */

const { format, formatDistanceToNow, formatRelative, isValid, parseISO } = require('date-fns');

/**
 * Format date for display
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} formatString - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
function formatDate(dateString, formatString = 'MMM dd, yyyy') {
    if (!dateString) return 'N/A';
    try {
        let date;
        if (dateString instanceof Date) {
            date = dateString;
        } else {
            date = parseISO(dateString);
        }
        
        if (!isValid(date)) {
            return 'N/A';
        }
        
        return format(date, formatString);
    } catch (e) {
        return 'N/A';
    }
}

/**
 * Format date with time
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date with time
 */
function formatDateTime(dateString) {
    return formatDate(dateString, 'MMM dd, yyyy hh:mm a');
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
function formatRelativeTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        let date;
        if (dateString instanceof Date) {
            date = dateString;
        } else {
            date = parseISO(dateString);
        }
        
        if (!isValid(date)) {
            return 'N/A';
        }
        
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return 'N/A';
    }
}

/**
 * Format date for grid display (short format)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Short formatted date
 */
function formatDateShort(dateString) {
    return formatDate(dateString, 'MM/dd/yyyy');
}

/**
 * Format date for table display
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Table formatted date
 */
function formatDateTable(dateString) {
    return formatDate(dateString, 'MMM dd, yyyy');
}

module.exports = {
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatDateShort,
    formatDateTable
};

