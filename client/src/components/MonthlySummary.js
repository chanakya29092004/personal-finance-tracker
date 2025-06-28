import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const MonthlySummary = () => {
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    incomeCategories: [],
    expenseCategories: [],
    totalTransactions: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchSummaryData();
    fetchMonthlyTrends();
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSummaryData = async () => {
    try {
      const startDate = format(startOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');

      const response = await transactionsAPI.getSummary({
        startDate,
        endDate
      });

      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchMonthlyTrends = async () => {
    try {
      setLoading(true);
      const currentDate = new Date(selectedMonth);
      const startDate = startOfMonth(subMonths(currentDate, 5));
      const endDate = endOfMonth(currentDate);

      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      const monthlyPromises = months.map(async (month) => {
        const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
        
        const response = await transactionsAPI.getSummary({
          startDate: monthStart,
          endDate: monthEnd
        });

        return {
          month: format(month, 'MMM yyyy'),
          income: response.data.income,
          expenses: response.data.expenses,
          balance: response.data.balance
        };
      });

      const results = await Promise.all(monthlyPromises);
      setMonthlyData(results);
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateColorPalette = (count) => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'
    ];
    return colors.slice(0, count);
  };

  const expenseChartData = {
    labels: summary.expenseCategories.map(cat => cat.category),
    datasets: [
      {
        data: summary.expenseCategories.map(cat => cat.total),
        backgroundColor: generateColorPalette(summary.expenseCategories.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const incomeChartData = {
    labels: summary.incomeCategories.map(cat => cat.category),
    datasets: [
      {
        data: summary.incomeCategories.map(cat => cat.total),
        backgroundColor: generateColorPalette(summary.incomeCategories.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const monthlyTrendsData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(data => data.income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(data => data.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Summary</h1>
              <p className="text-gray-600">Detailed monthly financial analysis and trends</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-900">
                Select Month:
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-input w-40"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card group hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <span className="text-success-600 text-xl">💰</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(summary.income)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(selectedMonth), 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="card group hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                  <span className="text-danger-600 text-xl">💸</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-danger-600">{formatCurrency(summary.expenses)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(selectedMonth), 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="card group hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  summary.balance >= 0 ? 'bg-primary-100' : 'bg-warning-100'
                }`}>
                  <span className={`text-xl ${
                    summary.balance >= 0 ? 'text-primary-600' : 'text-warning-600'
                  }`}>
                    {summary.balance >= 0 ? '📈' : '📉'}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  summary.balance >= 0 ? 'text-primary-600' : 'text-warning-600'
                }`}>
                  {formatCurrency(summary.balance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.balance >= 0 ? 'Savings' : 'Deficit'}
                </p>
              </div>
            </div>
          </div>

          <div className="card group hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <span className="text-secondary-600 text-xl">📊</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-secondary-600">{summary.totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This month
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Monthly Trends */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Trend</h3>
        <Line data={monthlyTrendsData} options={lineChartOptions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
          {summary.incomeCategories.length > 0 ? (
            <>
              <Doughnut data={incomeChartData} options={chartOptions} />
              <div className="mt-4 space-y-2">
                {summary.incomeCategories.map((category, index) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: generateColorPalette(summary.incomeCategories.length)[index] }}
                      ></div>
                      <span className="text-sm text-gray-600">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No income data for this month</p>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {summary.expenseCategories.length > 0 ? (
            <>
              <Doughnut data={expenseChartData} options={chartOptions} />
              <div className="mt-4 space-y-2">
                {summary.expenseCategories.map((category, index) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: generateColorPalette(summary.expenseCategories.length)[index] }}
                      ></div>
                      <span className="text-sm text-gray-600">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data for this month</p>
          )}
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((data, index) => {
                const savingsRate = data.income > 0 ? ((data.income - data.expenses) / data.income * 100) : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(data.income)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(data.expenses)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      data.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(data.balance)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {savingsRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
