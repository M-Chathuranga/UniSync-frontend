import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

const AUTH_USER_KEY = '@smart_finance_auth_user';
const BIOMETRIC_ENABLED_KEY = '@smart_finance_biometric_enabled';
const DASHBOARD_CACHE_KEY = '@smart_finance_dashboard_cache';
const CUSTOM_BUDGETS_KEY = '@smart_finance_custom_category_budgets';
const CURRENCY_OPTIONS = [
  { code: 'LKR', label: 'Sri Lankan Rupee (LKR)', symbol: 'Rs' },
  { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
  { code: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
];
export default function SettingsScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dailyLimitAlerts, setDailyLimitAlerts] = useState(true);
  const [voiceLogging, setVoiceLogging] = useState(true);
  const [loading, setSaving] = useState(false);

  // Modals
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [newAllowance, setNewAllowance] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: 'LKR',
    label: 'Sri Lankan Rupee (LKR)',
    symbol: 'Rs',
  });

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: '',
    firstName: '',
    lastName: '',
    monthlyAllowance: 0,
  });

  useEffect(() => {
    const loadBiometricPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        if (saved !== null) {
          setBiometricEnabled(saved === 'true');
        }
      } catch (e) {
        console.error('Failed to load biometric setting:', e);
      }
    };
    loadBiometricPreference();
  }, []);

  const handleToggleBiometric = async (newValue) => {
    setBiometricEnabled(newValue);
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(newValue));
    } catch (e) {
      console.error('Failed to save biometric setting:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsFromAPI();
    }, [])
  );

  // Load user profile & monthly allowance from local session/cache first, then sync with backend API
  const loadSettingsFromAPI = async () => {
    const savedCurrencyRaw = await AsyncStorage.getItem('@smart_finance_currency');
      if (savedCurrencyRaw) {
        setSelectedCurrency(JSON.parse(savedCurrencyRaw));
      }
    try {
      // 1. Load fallback user info from local AsyncStorage session & dashboard cache
      const [storedSession, storedDashCache] = await Promise.all([
        AsyncStorage.getItem(AUTH_USER_KEY),
        AsyncStorage.getItem(DASHBOARD_CACHE_KEY),
      ]);

      let cachedAllowance = 0;
      if (storedDashCache) {
        try {
          const dashParsed = JSON.parse(storedDashCache);
          cachedAllowance = Number(dashParsed?.monthlyAllowance || dashParsed?.income || 0);
        } catch (_) {}
      }

      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const sessionUser = parsed.user || parsed;
        if (sessionUser?.email || sessionUser?.firstName || sessionUser?.name) {
          const fullName =
            `${sessionUser.firstName || ''} ${sessionUser.lastName || ''}`.trim() ||
            sessionUser.name ||
            'User';
          setUserProfile((prev) => ({
            ...prev,
            name: fullName,
            email: sessionUser.email || prev.email,
            firstName: sessionUser.firstName || prev.firstName,
            lastName: sessionUser.lastName || prev.lastName,
            monthlyAllowance:
              Number(sessionUser.monthlyAllowance) || cachedAllowance || prev.monthlyAllowance,
          }));
        }
      }

      // 2. Fetch latest profile & allowance from backend API
      const res = await api.getSettings();
      const user = res?.data || res;

      if (user) {
        setUserProfile((prev) => ({
          name:
            `${user.firstName || prev.firstName || ''} ${user.lastName || prev.lastName || ''}`.trim() ||
            user.name ||
            prev.name ||
            'User',
          email: user.email || prev.email || '',
          firstName: user.firstName || prev.firstName || '',
          lastName: user.lastName || prev.lastName || '',
          monthlyAllowance:
            Number(user.monthlyAllowance) > 0
              ? Number(user.monthlyAllowance)
              : cachedAllowance || prev.monthlyAllowance || 0,
        }));

        setDailyLimitAlerts(user.preferences?.dailyLimitAlerts ?? true);
        setVoiceLogging(user.preferences?.voiceLogging ?? true);
      }
    } catch (e) {
      console.error('Failed to load settings from API:', e);
    }
  };

  const handleToggleChange = async (field, value) => {
    try {
      await api.updateSettings({ [field]: value });
    } catch (e) {
      console.error('Error saving preference toggle:', e);
    }
  };

  const handleSaveAllowance = async () => {
    const CURRENCY_OPTIONS = [
    { code: 'LKR', label: 'Sri Lankan Rupee (LKR)', symbol: 'Rs' },
    { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
    { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
    { code: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
    { code: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
  ];

  const handleSelectCurrency = async (currencyObj) => {
    setSelectedCurrency(currencyObj);
    setShowCurrencyModal(false);
    try {
      await AsyncStorage.setItem('@smart_finance_currency', JSON.stringify(currencyObj));
      await api.updateSettings({ currency: currencyObj.code });
    } catch (e) {
      console.warn('Currency saved locally; backend sync skipped:', e.message);
    }
  };
    const parsed = parseFloat(newAllowance);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid', 'Please enter a valid positive number for monthly allowance.');
      return;
    }

    try {
      setSaving(true);
      await api.updateSettings({ monthlyAllowance: parsed });
      setUserProfile((prev) => ({ ...prev, monthlyAllowance: parsed }));
      setShowBudgetModal(false);
      setNewAllowance('');
      Alert.alert('Saved', 'Monthly allowance updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update allowance on server.');
    } finally {
      setSaving(false);
    }
  };

  const clearLocalStorageSession = async () => {
    await AsyncStorage.multiRemove([
      AUTH_USER_KEY,
      DASHBOARD_CACHE_KEY,
      CUSTOM_BUDGETS_KEY,
    ]);
    setUserProfile({ name: 'User', email: '', firstName: '', lastName: '', monthlyAllowance: 0 });
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearLocalStorageSession();
          } catch (error) {
            console.error('Error clearing session on logout:', error);
          } finally {
            router.replace('/login');
          }
        },
      },
    ]);
  };

  // Permanent Account Deletion (Google Play Store Requirement)
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account Permanently',
      'This will permanently delete your profile, all expense records, budgets, and notifications. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              await clearLocalStorageSession();
              Alert.alert('Account Deleted', 'Your account and all associated data have been permanently removed.');
              router.replace('/login');
            } catch (error) {
              Alert.alert('Deletion Failed', error.message || 'Could not delete account right now. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-[#0f172a] mb-4">Settings</Text>

        {/* User Profile Card */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] flex-row items-center mb-5">
          <View className="w-14 h-14 rounded-2xl bg-[#ede9fe] items-center justify-center mr-3.5 border border-[#c7d2fe]">
            <Text className="text-xl font-extrabold text-[#4143d5]">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-[#0f172a]">{userProfile.name}</Text>
            <Text className="text-xs text-[#64748b] mt-0.5">{userProfile.email || 'No email'}</Text>
            <Text className="text-[11px] font-semibold text-[#16a34a] mt-1">● Active Account</Text>
          </View>
        </View>

       {/* Financial Preferences */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          FINANCIAL PREFERENCES
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          <TouchableOpacity
            onPress={() => setShowCurrencyModal(true)}
            className="flex-row items-center justify-between pb-3.5 border-b border-[#f8fafc]"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#ede9fe] items-center justify-center mr-3">
                <Ionicons name="cash-outline" size={18} color="#4143d5" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Currency</Text>
                <Text className="text-[11px] text-[#64748b]">{selectedCurrency.label}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setNewAllowance(String(userProfile.monthlyAllowance));
              setShowBudgetModal(true);
            }}
            className="flex-row items-center justify-between py-3.5 border-b border-[#f8fafc]"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#dcfce7] items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={18} color="#16a34a" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Monthly Allowance</Text>
                <Text className="text-[11px] text-[#64748b]">
                  {selectedCurrency.symbol} {userProfile.monthlyAllowance.toLocaleString()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between pt-3.5">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#fee2e2] items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={18} color="#ef4444" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Budget Cycle Start</Text>
                <Text className="text-[11px] text-[#64748b]">1st of every month</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security & Biometrics */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          SECURITY
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#ede9fe] items-center justify-center mr-3">
                <Ionicons name="finger-print-outline" size={18} color="#4143d5" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0f172a]">Fingerprint Unlock</Text>
                <Text className="text-[11px] text-[#64748b]">
                  Use phone fingerprint or Face ID to open app
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Assistant & Alerts */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          ASSISTANT & ALERTS
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          <View className="flex-row items-center justify-between pb-3.5 border-b border-[#f8fafc]">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#ede9fe] items-center justify-center mr-3">
                <Ionicons name="mic-outline" size={18} color="#4143d5" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0f172a]">Voice Expense Logging</Text>
                <Text className="text-[11px] text-[#64748b]">
                  Allow saving expenses via voice input
                </Text>
              </View>
            </View>
            <Switch
              value={voiceLogging}
              onValueChange={(val) => {
                setVoiceLogging(val);
                handleToggleChange('voiceLogging', val);
              }}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>

          <View className="flex-row items-center justify-between pt-3.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#fef3c7] items-center justify-center mr-3">
                <Ionicons name="warning-outline" size={18} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0f172a]">Daily Budget Alerts</Text>
                <Text className="text-[11px] text-[#64748b]">
                  Notify when today's spending exceeds the safe limit
                </Text>
              </View>
            </View>
            <Switch
              value={dailyLimitAlerts}
              onValueChange={(val) => {
                setDailyLimitAlerts(val);
                handleToggleChange('dailyLimitAlerts', val);
              }}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Privacy & Legal (Play Store Compliance) */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          PRIVACY & DATA
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          <TouchableOpacity
            onPress={() => setShowPrivacyModal(true)}
            className="flex-row items-center justify-between pb-3.5 border-b border-[#f8fafc]"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#e0f2fe] items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={18} color="#0284c7" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Privacy Policy</Text>
                <Text className="text-[11px] text-[#64748b]">How we protect your data & voice input</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center justify-between pt-3.5"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#fee2e2] items-center justify-center mr-3">
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#dc2626]">Delete Account</Text>
                <Text className="text-[11px] text-[#64748b]">Permanently erase account & all data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="bg-white rounded-2xl p-4 shadow-sm border border-[#fee2e2] flex-row items-center justify-center mb-5"
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text className="text-xs font-bold text-[#ef4444]">Log Out</Text>
        </TouchableOpacity>

        {/* App version footer */}
        <View className="items-center mt-1 mb-4">
          <Text className="text-xs font-bold text-[#94a3b8]">Smart Finance v1.0.0</Text>
          <Text className="text-[11px] text-[#cbd5e1] mt-0.5">
            Personal Student Expense Tracker
          </Text>
        </View>
      </ScrollView>

      {/* Monthly Allowance Edit Modal */}
      <Modal
        visible={showBudgetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-[32px] px-6 pt-5 pb-9">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-[#0f172a] mb-1">
              Update Monthly Allowance
            </Text>
            <Text className="text-xs text-[#64748b] mb-4">
              This amount will be used to calculate your safe daily spending limit.
            </Text>

            <Text className="text-xs font-semibold text-[#64748b] mb-1">Amount (Rs)</Text>
            <TextInput
              value={newAllowance}
              onChangeText={setNewAllowance}
              keyboardType="numeric"
              placeholder="e.g. 25000"
              placeholderTextColor="#94a3b8"
              className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0f172a] mb-5"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowBudgetModal(false)}
                className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAllowance}
                disabled={loading}
                className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center shadow-md"
              >
                <Text className="text-xs font-bold text-white">
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] px-6 pt-5 pb-9 max-h-[80%]">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-[#0f172a] mb-2">Privacy Policy</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              <Text className="text-xs text-[#475569] leading-5 mb-3">
                Smart Finance respects your privacy and is committed to protecting your personal and financial data.
              </Text>
              <Text className="text-xs font-bold text-[#0f172a] mb-1">1. Data We Collect</Text>
              <Text className="text-xs text-[#475569] leading-5 mb-3">
                We collect your name, email address, monthly allowance, and expense entries solely to provide personal budgeting features.
              </Text>
              <Text className="text-xs font-bold text-[#0f172a] mb-1">2. Microphone & Voice Processing</Text>
              <Text className="text-xs text-[#475569] leading-5 mb-3">
                Microphone audio is used only when you tap the voice logging button to transcribe expense details. Audio recordings are not permanently stored on our servers.
              </Text>
              <Text className="text-xs font-bold text-[#0f172a] mb-1">3. Biometric Authentication</Text>
              <Text className="text-xs text-[#475569] leading-5 mb-3">
                Fingerprint and Face ID checks are handled entirely by your device operating system. Smart Finance never accesses or stores your biometric data.
              </Text>
              <Text className="text-xs font-bold text-[#0f172a] mb-1">4. Account & Data Deletion</Text>
              <Text className="text-xs text-[#475569] leading-5">
                You may permanently delete your account and all associated records at any time from Settings → Delete Account.
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              className="bg-[#4143d5] py-3.5 rounded-xl items-center"
            >
              <Text className="text-xs font-bold text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] px-6 pt-5 pb-9">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-[#0f172a] mb-1">Select Currency</Text>
            <Text className="text-xs text-[#64748b] mb-4">
              Choose your preferred currency for tracking expenses.
            </Text>

            {CURRENCY_OPTIONS.map((item) => {
              const isSelected = selectedCurrency.code === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => handleSelectCurrency(item)}
                  className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                    isSelected
                      ? 'bg-[#ede9fe] border-[#4143d5]'
                      : 'bg-[#f8fafc] border-[#f1f5f9]'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-xl bg-white items-center justify-center mr-3">
                      <Text className="text-xs font-extrabold text-[#4143d5]">{item.symbol}</Text>
                    </View>
                    <Text className="text-xs font-bold text-[#0f172a]">{item.label}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#4143d5" />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setShowCurrencyModal(false)}
              className="mt-3 bg-gray-100 py-3.5 rounded-xl items-center"
            >
              <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}