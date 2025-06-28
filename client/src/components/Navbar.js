import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/add-transaction', label: 'Add Transaction', icon: '➕' },
    { path: '/transactions', label: 'History', icon: '📋' },
    { path: '/summary', label: 'Summary', icon: '📈' },
    { path: '/pricing', label: 'Pricing', icon: '💎' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">💰</div>
            <div>
              <div className="logo-text">FinanceTracker</div>
              <div className="text-xs text-gray-500 font-medium">Professional</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary !py-2 !px-3 text-xs whitespace-nowrap"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''} flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="px-3 py-2 text-sm text-gray-600">
                  Signed in as <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
