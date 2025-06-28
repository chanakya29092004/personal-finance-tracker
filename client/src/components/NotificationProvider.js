import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, duration } = notification;
  
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const typeStyles = {
    success: {
      bg: 'bg-success-50 border-success-200',
      icon: '✅',
      iconColor: 'text-success-500',
      textColor: 'text-success-800'
    },
    error: {
      bg: 'bg-danger-50 border-danger-200',
      icon: '❌',
      iconColor: 'text-danger-500',
      textColor: 'text-danger-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ️',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${style.bg} border rounded-lg p-4 shadow-lg animate-slide-in-right transition-all duration-300 max-w-sm w-full`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`${style.iconColor} text-xl`}>{style.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className={`text-sm font-semibold ${style.textColor} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${style.textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`ml-2 ${style.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'success', message });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'error', message, duration: 7000 });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'warning', message });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'info', message });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
