import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

const defaultPreferences = {
  currency: 'INR',
  dateFormat: 'dd/MM/yyyy',
  emailNotifications: true,
  budgetAlerts: true,
  monthlyReports: false
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = async (newPreferences) => {
    setLoading(true);
    try {
      // Simulate API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      return { success: true };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: 'Failed to save preferences' };
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$'
    };
    return symbols[currency] || currency;
  };

  const formatCurrency = (amount, currency = preferences.currency) => {
    const symbol = getCurrencySymbol(currency);
    
    // Format based on currency
    if (currency === 'INR') {
      // Indian number format with lakhs and crores
      return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
    } else {
      // Standard international format
      return `${symbol}${Number(amount).toLocaleString()}`;
    }
  };

  const formatDate = (date, format = preferences.dateFormat) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const value = {
    preferences,
    loading,
    updatePreferences,
    getCurrencySymbol,
    formatCurrency,
    formatDate
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export default UserPreferencesContext;
