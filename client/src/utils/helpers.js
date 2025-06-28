// Utility functions for the finance tracker app

/**
 * Format currency with proper locale
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate amount (positive number)
 */
export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Get category icon based on category name
 */
export const getCategoryIcon = (category, type) => {
  const categoryIcons = {
    income: {
      salary: '💼',
      freelance: '💻',
      investment: '📈',
      business: '🏢',
      gift: '🎁',
      'other income': '💰'
    },
    expense: {
      food: '🍕',
      transportation: '🚗',
      housing: '🏠',
      utilities: '⚡',
      entertainment: '🎬',
      healthcare: '🏥',
      shopping: '🛍️',
      education: '📚',
      insurance: '🛡️',
      'other expense': '📋'
    }
  };
  
  const typeCategories = categoryIcons[type] || {};
  const categoryKey = category.toLowerCase();
  return typeCategories[categoryKey] || (type === 'income' ? '💰' : '💸');
};

/**
 * Generate random color for charts
 */
export const generateChartColors = (count) => {
  const baseColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Local storage helpers with error handling
 */
export const localStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${error}`);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
      return false;
    }
  }
};

/**
 * Error message extractor for API responses
 */
export const extractErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 
           error.response.data?.error ||
           error.response.statusText ||
           'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Form validation helpers
 */
export const validation = {
  required: (value) => {
    return value && value.toString().trim().length > 0;
  },
  
  email: (value) => {
    return isValidEmail(value);
  },
  
  minLength: (value, min) => {
    return value && value.toString().length >= min;
  },
  
  maxLength: (value, max) => {
    return !value || value.toString().length <= max;
  },
  
  numeric: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  positive: (value) => {
    return parseFloat(value) > 0;
  }
};
