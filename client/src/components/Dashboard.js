import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import { useUserPreferences } from '../context/UserPreferencesContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const location = useLocation();
  const { formatCurrency } = useUserPreferences();
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    incomeCategories: [],
    expenseCategories: [],
    totalTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dateRange, setDateRange] = useState('current-month');

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        let params = {};
        const now = new Date();
        
        switch (dateRange) {
          case 'current-month':
            params.startDate = format(startOfMonth(now), 'yyyy-MM-dd');
            params.endDate = format(endOfMonth(now), 'yyyy-MM-dd');
            break;
          case 'last-30-days':
            params.startDate = format(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
            params.endDate = format(now, 'yyyy-MM-dd');
            break;
          default:
            // All time - no date filters
            break;
        }

        const [summaryResponse, transactionsResponse] = await Promise.all([
          transactionsAPI.getSummary(params),
          transactionsAPI.getTransactions({ ...params, limit: 5 })
        ]);

        setSummary(summaryResponse.data);
        setRecentTransactions(transactionsResponse.data.transactions || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const expenseChartData = {
    labels: summary.expenseCategories.map(cat => cat.category),
    datasets: [
      {
        data: summary.expenseCategories.map(cat => cat.total),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
          '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'
        ],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff',
      },
    ],
  };

  const incomeVsExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [summary.income, summary.expenses],
        backgroundColor: ['#10b981', '#ef4444'],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(summary.balance),
      change: summary.balance >= 0 ? 'positive' : 'negative',
      icon: '💰',
      color: summary.balance >= 0 ? 'gradient-success' : 'gradient-danger',
      subtitle: 'Current balance'
    },
    {
      title: 'Total Income',
      value: formatCurrency(summary.income),
      change: 'positive',
      icon: '📈',
      color: 'gradient-success',
      subtitle: `From ${summary.income > 0 ? summary.incomeCategories.length : 0} categories`
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.expenses),
      change: 'negative',
      icon: '📉',
      color: 'gradient-danger',
      subtitle: `From ${summary.expenses > 0 ? summary.expenseCategories.length : 0} categories`
    },
    {
      title: 'Transactions',
      value: summary.totalTransactions.toString(),
      change: 'neutral',
      icon: '📊',
      color: 'gradient-primary',
      subtitle: 'Total records'
    }
  ];

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-success-500 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-success-800 font-medium">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-auto text-success-500 hover:text-success-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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

        {/* Enhanced Page Header */}
        <div className="page-header animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="page-title">
                Financial Dashboard
              </h1>
              <p className="page-subtitle">
                Welcome back! Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select w-44"
              >
                <option value="current-month">Current Month</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="all-time">All Time</option>
              </select>
              
              <Link 
                to="/add-transaction" 
                className="btn-primary interactive-hover animate-scale-in"
              >
                ➕ Add Transaction
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up">
          {statsCards.map((stat, index) => (
            <div 
              key={index} 
              className="stats-card group animate-scale-in interactive-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`stats-icon ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`stats-change ${stat.change} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  {stat.change === 'positive' ? '↗' : stat.change === 'negative' ? '↘' : '→'}
                </div>
              </div>
              <div>
                <div className="stats-value">{stat.value}</div>
                <div className="stats-label">{stat.title}</div>
                <div className="text-xs text-gray-500 mt-2 font-medium">{stat.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Income vs Expenses Chart */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Income vs Expenses</h3>
                  <p className="card-subtitle">Financial performance overview</p>
                </div>
              </div>
              <div className="h-64">
                <Bar data={incomeVsExpenseData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Expense Breakdown</h3>
                  <p className="card-subtitle">By category</p>
                </div>
              </div>
              <div className="h-64">
                {summary.expenseCategories.length > 0 ? (
                  <Doughnut data={expenseChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No expense data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-subtitle">Latest financial activity</p>
            </div>
            <Link 
              to="/transactions" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
            >
              View all →
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="group">
                      <td className="font-medium text-gray-900">
                        {format(new Date(transaction.date), 'MMM dd')}
                      </td>
                      <td>
                        <div className="text-gray-900 font-medium">
                          {transaction.note || 'No description'}
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
                          {transaction.type}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first transaction</p>
              <Link to="/add-transaction" className="btn-primary">
                Add Transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
