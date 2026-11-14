import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_KEY = '@smart_finance_auth_user';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Read JWT token from AsyncStorage and build Authorization header
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

export const api = {
  // AUTH
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (firstName, lastName, email, password) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  // DASHBOARD
  getDashboard: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/dashboard/summary`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard metrics');
    return data;
  },

  // EXPENSES
  getExpenses: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch expenses');
    return data;
  },

  addExpense: async (expenseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create expense');
    return data;
  },

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

  updateExpense: async (expenseId, expenseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update expense');
    return data;
  },

  deleteExpense: async (expenseId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete expense');
    return data;
  },

  getCategorySummary: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/summary/category`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch category summary');
    return data;
  },

  getMonthlySummary: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/summary/monthly`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch monthly summary');
    return data;
  },

  // CATEGORIES
  getCategories: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data;
  },

  addCategory: async (categoryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add category');
    return data;
  },

  // NOTIFICATIONS
  createNotification: async (notificationData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(notificationData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create notification');
    return data;
  },

  getNotifications: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data;
  },

  markNotificationRead: async (notificationId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to mark notification as read');
    return data;
  },

  deleteNotification: async (notificationId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete notification');
    return data;
  },

  // SETTINGS
  getSettings: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
    return data;
  },

  updateSettings: async (settingsData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settingsData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update settings');
    return data;
  },

  // FIXED EXPENSES
  addFixedExpense: async (expenseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/fixedexpenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add fixed expense');
    return data;
  },

  getFixedExpenses: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/fixedexpenses`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch fixed expenses');
    return data;
  },
};