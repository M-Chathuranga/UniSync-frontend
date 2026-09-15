import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const AUTH_USER_KEY = '@smart_finance_auth_user'; // Key used to store JWT session
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;  // e.g. http://192.168.x.x:5000

// ─────────────────────────────────────────────
// Helper: Read JWT token from AsyncStorage and build Authorization header
// Every protected route must include this header — the backend extracts req.user from it
// ─────────────────────────────────────────────
const getAuthHeaders = async () => {
  try {
    const userSession = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (userSession) {
      const parsedData = JSON.parse(userSession);
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parsedData.token}`, // Bearer JWT — validates the user server-side
      };
    }
  } catch (error) {
    console.error('Error reading authentication token:', error);
  }
  // If no token found, return minimal headers (backend will respond 401)
  return { 'Content-Type': 'application/json' };
};

// ─────────────────────────────────────────────
// API Object — all backend calls centralised here
// Import this in any screen: import { api } from '../../services/api';
// ─────────────────────────────────────────────
export const api = {

  // ── AUTH (no token required) ──────────────────────────────────

  // POST /auth/login — sends credentials, receives JWT + user info
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data; // { token, user: { id, name, email, firstName, lastName } }
  },

  // POST /auth/register — creates a new user account
  register: async (firstName, lastName, email, password) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data; // { message, user: { id, firstName, lastName, email } }
  },

  // ── DASHBOARD ──────────────────────────────────

  // GET /dashboard/summary — returns daily budget summary for the logged-in user
  // Includes: monthlyAllowance, totalFixedExpenses, safeDailyLimit, totalSpentToday, remainingDailyBalance, isOverBudget
  getDashboard: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/dashboard/summary`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard metrics');
    return data;
  },

  // ── EXPENSES ──────────────────────────────────

  // GET /expenses — all variable expenses for the logged-in user, sorted newest first
  getExpenses: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch expenses');
    return data; // Array of expense objects [ { _id, title, amount, category, date } ]
  },

  // POST /expenses/add — add a new manual expense
  // Body: { title, amount, category }
  addExpense: async (expenseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create expense');
    return data; // { message, data: newExpense }
  },

  // POST /expenses/voice — log expense parsed from transcribed voice text
  // Body: { voiceText: "I spent 120 on bus" }
  addVoiceExpense: async (voiceText) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/voice`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ voiceText }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to process voice expense');
    return data; // { message, data: newVoiceExpense }
  },

  // GET /expenses/summary/category — total spending grouped by category (used in Pie Chart)
  // Returns: { data: [ { category, totalAmount } ] }
  getCategorySummary: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/summary/category`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch category summary');
    return data;
  },

  // GET /expenses/summary/monthly — total spending grouped by month (used in Line Chart)
  // Returns: { data: [ { year, month, totalAmount } ] }
  getMonthlySummary: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/expenses/summary/monthly`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch monthly summary');
    return data;
  },

  // ── CATEGORIES ──────────────────────────────────

  // GET /categories — fetch all categories created by the logged-in user
  getCategories: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data; // Array of [ { _id, name, icon, userId } ]
  },

  // POST /categories — create a new spending category
  // Body: { name, icon }
  addCategory: async (categoryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add category');
    return data; // { message, data: newCategory }
  },

  // ── NOTIFICATIONS ──────────────────────────────────

  // GET /notifications — all notifications for the logged-in user, newest first
  getNotifications: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data; // Array of [ { _id, title, message, type, isRead, createdAt } ]
  },

  // PUT /notifications/:id/read — mark a notification as read
  markNotificationRead: async (notificationId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',  // Backend uses PUT for this route
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to mark notification as read');
    return data;
  },

  // DELETE /notifications/:id — permanently delete a notification
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

  // ── SETTINGS ──────────────────────────────────

  // GET /settings — fetch user profile and preferences from backend DB
  // Returns: { data: { firstName, lastName, email, image, monthlyAllowance, preferences } }
  getSettings: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/settings`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
    return data;
  },

  // PUT /settings — update monthly allowance or preference toggles
  // Body: { monthlyAllowance?, dailyLimitAlerts?, voiceLogging?, appearance? }
  updateSettings: async (settingsData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settingsData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update settings');
    return data; // { message, data: updatedUser }
  },

  // ── FIXED EXPENSES ──────────────────────────────────

  // POST /fixedexpenses — add a recurring fixed expense (rent, subscriptions, etc.)
  // Body: { title, amount }
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

  // GET /fixedexpenses — fetch all fixed expenses for the logged-in user
  getFixedExpenses: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/fixedexpenses`, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch fixed expenses');
    return data; // Array of [ { _id, title, amount, userId } ]
  },
};