import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_KEY = '@smart_finance_auth_user';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper function to extract token from storage and create authorization header
const getAuthHeaders = async () => {
  try {
    const userSession = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (userSession) {
      const parsedData = JSON.parse(userSession);

      

      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parsedData.token}`,
      };
    }
  } catch (error) {
    console.error('Error reading authentication token:', error);
  }
  return { 'Content-Type': 'application/json' };
};

// API calls wrapper object
export const api = {
  // Fetch Dashboard Summary Data
  getDashboard: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/dashboard`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard metrics');
    return data;
  },

  // Fetch Expenses List
  getExpenses: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch expenses');
    return data;
  },

  // Add New Expense Record
  addExpense: async (expenseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create expense');
    return data;
  },
  // Add Expense via Voice Input
  addVoiceExpense: async (voiceText) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/voice`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ voiceText }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to process voice expense');
    return data;
  },

  // Fetch Spending Categories
  getCategories: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data;
  },
};