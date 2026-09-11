import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    userName: 'Kavishka',
    safeToSpend: 0,
    daysLeft: 0,
    month: '',
    income: 0,
    expenses: 0,
    balance: 0,
    chartData: [],
    breakdown: [],
    recentActivity: [],
  });
  const [transactions, setTransactions] = useState([]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [dashData, txData] = await Promise.all([
        api.getDashboard(),
        api.getTransactions(),
      ]);
      setDashboard(dashData);
      setTransactions(txData);
    } catch (err) {
      console.warn('Backend unavailable, using local state fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const createExpense = async (expense) => {
    try {
      await api.addTransaction(expense);
      await refreshData();
    } catch (err) {
      // Offline fallback state update
      setDashboard((prev) => {
        const newExpenses = prev.expenses + expense.amount;
        const newBalance = prev.balance - expense.amount;
        const newSafe = Math.max(0, Math.round(newBalance / (prev.daysLeft || 1)));

        return {
          ...prev,
          expenses: newExpenses,
          balance: newBalance,
          safeToSpend: newSafe,
          recentActivity: [
            {
              id: String(Date.now()),
              title: expense.title,
              sub: `${expense.category} · Just now`,
              amount: -expense.amount,
              icon: expense.icon || 'receipt',
            },
            ...prev.recentActivity,
          ],
        };
      });

      setTransactions((prev) => [
        {
          id: String(Date.now()),
          title: expense.title,
          category: expense.category,
          time: 'Just now',
          amount: -expense.amount,
          icon: expense.icon || 'receipt',
        },
        ...prev,
      ]);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        dashboard,
        transactions,
        loading,
        refreshData,
        createExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);