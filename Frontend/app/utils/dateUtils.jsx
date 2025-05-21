/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} dateStr - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  };
  
  /**
   * Format a currency amount
   * @param {number} amount - The amount to format
   * @param {string} currency - The currency code (default: USD)
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Calculate the difference between two dates in days
   * @param {string|Date} date1 - The first date
   * @param {string|Date} date2 - The second date (default: current date)
   * @returns {number} The difference in days
   */
  export const dateDiffInDays = (date1, date2 = new Date()) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // Check if dates are valid
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    
    // Convert to UTC to avoid timezone issues
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    // Calculate difference in days
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  };
  
  /**
   * Get a human-readable relative time description
   * @param {string|Date} date - The date to compare
   * @returns {string} A relative time description
   */
  export const getRelativeTime = (date) => {
    const now = new Date();
    const inputDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(inputDate.getTime())) return 'Invalid date';
    
    const diffInMinutes = Math.floor((now - inputDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    // For older dates, return a formatted date
    return formatDate(date, { hour: undefined, minute: undefined });
  };
  
  export default {
    formatDate,
    formatCurrency,
    dateDiffInDays,
    getRelativeTime
  };