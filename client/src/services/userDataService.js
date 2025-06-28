// User data service for AI assistant
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class UserDataService {
  // Get user's financial summary
  static async getFinancialSummary() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await axios.get(`${API_URL}/transactions/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.log('Error fetching financial summary:', error);
      return null;
    }
  }
  
  // Get recent transactions
  static async getRecentTransactions(limit = 10) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];
      
      const response = await axios.get(`${API_URL}/transactions?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.transactions || [];
    } catch (error) {
      console.log('Error fetching recent transactions:', error);
      return [];
    }
  }
  
  // Format currency for display
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Generate insights based on user data
  static async generateInsights() {
    const summary = await this.getFinancialSummary();
    if (!summary) return null;
    
    const insights = {
      spendingTrend: summary.weeklyExpenses > (summary.recentExpenses / 4) ? 'increasing' : 'stable',
      topExpenseCategory: summary.topCategories[0]?.category || 'Unknown',
      savingsHealth: summary.savingsRate > 20 ? 'excellent' : summary.savingsRate > 10 ? 'good' : 'needs_improvement',
      totalExpenses: this.formatCurrency(summary.totalExpenses),
      recentExpenses: this.formatCurrency(summary.recentExpenses),
      netSavings: this.formatCurrency(summary.netSavings),
      savingsRate: summary.savingsRate
    };
    
    return insights;
  }
}

export default UserDataService;
