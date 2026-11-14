import React, { useState, useCallback } from 'react';
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

// Key used to store the JWT session in AsyncStorage
const AUTH_USER_KEY = '@smart_finance_auth_user';

export default function SettingsScreen() {
  // ── Local state ────────────────────────────────────────────────
  const [dailyLimitAlerts, setDailyLimitAlerts] = useState(true);
  const [voiceLogging, setVoiceLogging] = useState(true);
  const [loading, setSaving] = useState(false);

  // Budget edit modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newAllowance, setNewAllowance] = useState('');

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: '',
    firstName: '',
    lastName: '',
    monthlyAllowance: 0,
  });

  // Reload settings every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      loadSettingsFromAPI();
    }, [])
  );

  // Fetch user profile and preferences from backend (GET /settings)
  const loadSettingsFromAPI = async () => {
    try {
      const res = await api.getSettings(); // Returns { data: { firstName, lastName, email, monthlyAllowance, preferences } }
      const user = res.data;

      setUserProfile({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        monthlyAllowance: user.monthlyAllowance || 0,
      });

      // Sync toggle states from backend preferences
      setDailyLimitAlerts(user.preferences?.dailyLimitAlerts ?? true);
      setVoiceLogging(user.preferences?.voiceLogging ?? true);
    } catch (e) {
      console.error('Failed to load settings from API:', e);
    }
  };

  // Save preference toggle changes to backend (PUT /settings)
  const handleToggleChange = async (field, value) => {
    try {
      await api.updateSettings({ [field]: value }); // Patch only the changed field
    } catch (e) {
      console.error('Error saving preference toggle:', e);
    }
  };

  // Save new monthly allowance to backend
  const handleSaveAllowance = async () => {
    const parsed = parseFloat(newAllowance);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid', 'Please enter a valid positive number for monthly allowance.');
      return;
    }

    try {
      setSaving(true);
      await api.updateSettings({ monthlyAllowance: parsed }); // PUT /settings
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

  // Clear AsyncStorage, local state, and redirect to login
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            // Remove the JWT session from local storage — prevents stale token reuse
            await AsyncStorage.removeItem(AUTH_USER_KEY);

            // Reset profile state to prevent any cached user data from leaking
            setUserProfile({ name: 'User', email: '', firstName: '', lastName: '', monthlyAllowance: 0 });
          } catch (error) {
            console.error('Error clearing session on logout:', error);
          } finally {
            // Always redirect to login regardless of error
            router.replace('/login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-[#0f172a] mb-4">Settings</Text>

        {/* ── User Profile Card ── */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] flex-row items-center mb-5">
          {/* Avatar: first letter of name */}
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

        {/* ── Financial Preferences ── */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          FINANCIAL PREFERENCES
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          {/* Currency — static display */}
          <TouchableOpacity className="flex-row items-center justify-between pb-3.5 border-b border-[#f8fafc]">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#ede9fe] items-center justify-center mr-3">
                <Ionicons name="cash-outline" size={18} color="#4143d5" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Currency</Text>
                <Text className="text-[11px] text-[#64748b]">Sri Lankan Rupee (LKR)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Monthly allowance — opens edit modal */}
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
                  Rs {userProfile.monthlyAllowance.toLocaleString()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Budget Cycle — static display */}
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

        {/* ── Assistant & Alerts ── */}
        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          ASSISTANT & ALERTS
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          {/* Voice Logging Toggle — synced to backend preferences.voiceLogging */}
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
                handleToggleChange('voiceLogging', val); // Persist to backend
              }}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Daily Limit Alert Toggle — synced to backend preferences.dailyLimitAlerts */}
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
                handleToggleChange('dailyLimitAlerts', val); // Persist to backend
              }}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Log Out Button ── */}
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
            Faculty of Technology · ICT 1108
          </Text>
        </View>
      </ScrollView>

      {/* ── Monthly Allowance Edit Modal ── */}
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
    </SafeAreaView>
  );
}