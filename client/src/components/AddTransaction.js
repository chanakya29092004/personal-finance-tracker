import React, { useState } from 'react';
import { transactionsAPI } from '../services/api';
import { useNotification } from './NotificationProvider';
import { UsageIndicator } from './UpgradePrompt';
import usePlanPermissions from '../hooks/usePlanPermissions';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AddTransaction = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotification();
  const { canUseFeature, getFeatureLimit } = usePlanPermissions();
  const navigate = useNavigate();

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income'],
    expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Insurance', 'Other Expense']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' && { category: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check plan limits before validation
    const transactionLimit = getFeatureLimit('transactions');
    if (transactionLimit !== 'unlimited' && !canUseFeature('transactions', 45)) { // 45 would come from actual usage
      showError(`You've reached your transaction limit of ${transactionLimit} for this month. Upgrade to Pro for unlimited transactions.`);
      return;
    }

    // Validation
    if (!formData.amount || !formData.category || !formData.type) {
      showError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      showError('Amount must be greater than 0');
      return;
    }

    if (parseFloat(formData.amount) > 1000000) {
      showError('Amount seems too large. Please verify the amount.');
      return;
    }

    if (!formData.date) {
      showError('Please select a valid date');
      return;
    }

    // Check if date is not in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      showError('Transaction date cannot be in the future');
      return;
    }

    // Check if date is not too far in the past (more than 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    if (selectedDate < fiveYearsAgo) {
      showError('Transaction date cannot be more than 5 years in the past');
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        note: formData.note.trim()
      };

      await transactionsAPI.createTransaction(transactionData);
      
      success('Transaction added successfully! 🎉');
      
      // Reset form
      setFormData({
        amount: '',
        category: '',
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        note: ''
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/', { state: { message: 'Transaction added successfully!' } });
      }, 2000);

    } catch (error) {
      console.error('Error adding transaction:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to add transaction. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 flex items-center transition-colors duration-200"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Transaction</h1>
          <p className="text-gray-600">Record your income or expense transaction</p>
        </div>

        {/* Usage Indicator for Free Plan */}
        <UsageIndicator 
          feature="transactions" 
          currentUsage={45} // This would come from actual API data
          className="mb-6"
        />

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Transaction Type <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.type === 'income' 
                    ? 'border-success-500 bg-success-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.type === 'income' 
                        ? 'border-success-500 bg-success-500' 
                        : 'border-gray-300'
                    }`}>
                      {formData.type === 'income' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg">📈</div>
                      <div className="text-sm font-medium text-gray-900">Income</div>
                    </div>
                  </div>
                </label>

                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.type === 'expense' 
                    ? 'border-danger-500 bg-danger-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.type === 'expense' 
                        ? 'border-danger-500 bg-danger-500' 
                        : 'border-gray-300'
                    }`}>
                      {formData.type === 'expense' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg">📉</div>
                      <div className="text-sm font-medium text-gray-900">Expense</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
                  Amount <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    min="0"
                    step="0.01"
                    required
                    className="form-input pl-8"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-2">
                  Date <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-danger-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories[formData.type].map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-semibold text-gray-900 mb-2">
                Description
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                className="form-input resize-none"
                placeholder="Add a note about this transaction..."
                value={formData.note}
                onChange={handleChange}
                maxLength={200}
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {formData.note.length}/200 characters
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Adding Transaction...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Add Transaction
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-xl">
          <h3 className="text-sm font-semibold text-primary-900 mb-3">💡 Quick Tips</h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Choose the correct transaction type (Income vs Expense)</li>
            <li>• Select an appropriate category for better tracking</li>
            <li>• Add detailed descriptions for future reference</li>
            <li>• Set the correct date if the transaction occurred on a different day</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
