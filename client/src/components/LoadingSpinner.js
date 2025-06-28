import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = '', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

const LoadingCard = ({ height = 'h-64' }) => {
  return (
    <div className={`card ${height} flex items-center justify-center`}>
      <LoadingSpinner text="Loading..." />
    </div>
  );
};

const LoadingTable = ({ rows = 5 }) => {
  return (
    <div className="card overflow-hidden">
      <div className="table-header">
        <div className="table-header-skeleton h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex space-x-4 animate-pulse">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="stats-card animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingPage = ({ title = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <LoadingStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingCard height="h-80" />
            <LoadingCard height="h-80" />
          </div>
          <LoadingTable />
        </div>
      </div>
    </div>
  );
};

export {
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  LoadingStats,
  LoadingPage
};

export default LoadingSpinner;
