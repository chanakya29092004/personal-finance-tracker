import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TransactionHistory = () => {
  const { formatCurrency, formatDate } = useUserPreferences();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: 10
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await transactionsAPI.getTransactions(params);
      setTransactions(response.data.transactions || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        setDeleteLoading(id);
        setError('');
        await transactionsAPI.deleteTransaction(id);
        
        // Update local state immediately for better UX
        setTransactions(prev => prev.filter(t => t._id !== id));
        
        // Fetch fresh data to ensure consistency
        fetchTransactions();
        
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction. Please try again.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
              <p className="text-gray-600">View and manage all your financial transactions</p>
            </div>
            <Link
              to="/add-transaction"
              className="btn-primary inline-flex items-center"
            >
              <span className="mr-2">➕</span>
              Add Transaction
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-danger-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-danger-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-danger-500 hover:text-danger-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="card mb-8">
          <div className="card-header mb-6">
            <div>
              <h2 className="card-title">Filter Transactions</h2>
              <p className="card-subtitle">Refine your transaction search</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transaction Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Search by category..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              🗑️ Clear Filters
            </button>
            <div className="text-sm text-gray-600">
              Showing {pagination.total} transactions
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="card-header mb-6">
            <div>
              <h2 className="card-title">Your Transactions</h2>
              <p className="card-subtitle">{pagination.total} total transactions</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-6">
                {Object.values(filters).some(filter => filter) 
                  ? "Try adjusting your filters or " 
                  : "Start tracking your finances by "}
                <span className="font-medium">adding your first transaction</span>
              </p>
              <Link to="/add-transaction" className="btn-primary">
                <span className="mr-2">➕</span>
                Add Transaction
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th className="text-right">Amount</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="group hover:bg-gray-50 transition-colors duration-200">
                          <td className="font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>{formatDate(transaction.date)}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(transaction.date), 'EEEE')}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 truncate">
                                {transaction.note || 'No description'}
                              </div>
                              {transaction.note && transaction.note.length > 30 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {transaction.note.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary">
                              {transaction.category}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              transaction.type === 'income' ? 'badge-success' : 'badge-danger'
                            }`}>
                              <span className="mr-1">
                                {transaction.type === 'income' ? '💰' : '💸'}
                              </span>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="text-right">
                            <span className={`font-semibold text-lg ${
                              transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              disabled={deleteLoading === transaction._id}
                              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 p-2 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              title="Delete transaction"
                            >
                              {deleteLoading === transaction._id ? (
                                <div className="loading-spinner w-4 h-4"></div>
                              ) : (
                                <span className="text-lg">🗑️</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        const isActive = page === pagination.currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              isActive 
                                ? 'bg-primary-500 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
