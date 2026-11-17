import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinanceContext = createContext();
const GLOBAL_FINANCE_KEY = '@smart_finance_global_data_v1';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food', budget: 5000, icon: 'restaurant', color: '#4143d5' },
  { id: '2', name: 'Boarding', budget: 6000, icon: 'home', color: '#10b981' },
  { id: '3', name: 'Transport', budget: 3000, icon: 'bus', color: '#ef4444' },
  { id: '4', name: 'Study', budget: 2500, icon: 'book', color: '#a855f7' },
  { id: '5', name: 'Other', budget: 2000, icon: 'receipt', color: '#64748b' },
];

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // App එක open වෙද්දී Storage එකෙන් Data load කිරීම
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const stored = await AsyncStorage.getItem(GLOBAL_FINANCE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed.transactions || []);
        setCategories(parsed.categories || DEFAULT_CATEGORIES);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistData = async (updatedTxs, updatedCats) => {
    try {
      await AsyncStorage.setItem(
        GLOBAL_FINANCE_KEY,
        JSON.stringify({ transactions: updatedTxs, categories: updatedCats })
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Transaction එකක් එක් කිරීම
  const addTransaction = (tx) => {
    const newTx = {
      id: Date.now().toString(),
      title: tx.title,
      amount: parseFloat(tx.amount),
      category: tx.category || 'Other',
      type: tx.type || 'expense', // 'expense' or 'income'
      icon: tx.icon || 'receipt',
      date: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    persistData(updated, categories);
  };

  // Transaction එකක් Delete කිරීම
  const deleteTransaction = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    persistData(updated, categories);
  };

  // සියල්ල Rs 0 බවට Reset කිරීම
  const resetAllData = async () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    await persistData([], DEFAULT_CATEGORIES);
  };

  // Live Finance Totals ගණනය කිරීම
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Categories වලට අදාළව spent අගයන් ගණනය කිරීම
  const categoriesWithLiveSpent = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, spent };
  });

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories: categoriesWithLiveSpent,
        income,
        expenses,
        balance,
        isLoading,
        addTransaction,
        deleteTransaction,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);