import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_KEY = '@smart_finance_auth_user';

export default function SettingsScreen() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: 'user@gmail.com',
    role: 'Student Account',
    monthlyLimit: '25,000.00',
  });

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        setUserProfile((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your monthly transaction report has been prepared for export (CSV).');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all recorded transactions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@smart_finance_dashboard_data');
            Alert.alert('Success', 'Transactions reset successfully.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(AUTH_USER_KEY);
            router.replace('/login');
          } catch (error) {
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

        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] flex-row items-center mb-5">
          <View className="w-14 h-14 rounded-2xl bg-[#ede9fe] items-center justify-center mr-3.5 border border-[#c7d2fe]">
            <Text className="text-xl font-extrabold text-[#4143d5]">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-[#0f172a]">{userProfile.name}</Text>
            <Text className="text-xs text-[#64748b] mt-0.5">{userProfile.email || 'No email attached'}</Text>
            <Text className="text-[11px] font-semibold text-[#16a34a] mt-1">● Active Account</Text>
          </View>
        </View>

        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          FINANCIAL PREFERENCES
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
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

          <TouchableOpacity className="flex-row items-center justify-between py-3.5 border-b border-[#f8fafc]">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#dcfce7] items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={18} color="#16a34a" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Monthly Spending Limit</Text>
                <Text className="text-[11px] text-[#64748b]">Rs {userProfile.monthlyLimit || '25,000.00'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between pt-3.5">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#fee2e2] items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={18} color="#ef4444" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Budget Cycle Start</Text>
                <Text className="text-[11px] text-[#64748b]">1st of every month</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

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
                <Text className="text-xs font-bold text-[#0f172a]">Voice Confirmation</Text>
                <Text className="text-[11px] text-[#64748b]">Review parsed voice expenses before save</Text>
              </View>
            </View>
            <Switch
              value={voiceFeedback}
              onValueChange={setVoiceFeedback}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>

          <View className="flex-row items-center justify-between py-3.5 border-b border-[#f8fafc]">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#fef3c7] items-center justify-center mr-3">
                <Ionicons name="warning-outline" size={18} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0f172a]">Budget Warning Alerts</Text>
                <Text className="text-[11px] text-[#64748b]">Alert when reaching 80% category budget</Text>
              </View>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>

          <View className="flex-row items-center justify-between pt-3.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#ecfdf5] items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0f172a]">Daily Reminder</Text>
                <Text className="text-[11px] text-[#64748b]">Remind to log expenses at 9:00 PM</Text>
              </View>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: '#cbd5e1', true: '#4143d5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2.5 px-1">
          DATA MANAGEMENT
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-5">
          <TouchableOpacity
            onPress={handleExportData}
            className="flex-row items-center justify-between pb-3.5 border-b border-[#f8fafc]"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#f1f5f9] items-center justify-center mr-3">
                <Ionicons name="download-outline" size={18} color="#475569" />
              </View>
              <Text className="text-xs font-bold text-[#0f172a]">Export Expenses as CSV</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetData}
            className="flex-row items-center justify-between pt-3.5"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#fee2e2] items-center justify-center mr-3">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <Text className="text-xs font-bold text-[#ef4444]">Reset All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="bg-white rounded-2xl p-4 shadow-sm border border-[#fee2e2] flex-row items-center justify-center mb-5"
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text className="text-xs font-bold text-[#ef4444]">Log Out</Text>
        </TouchableOpacity>

        <View className="items-center mt-1 mb-4">
          <Text className="text-xs font-bold text-[#94a3b8]">Smart Finance v1.0.0</Text>
          <Text className="text-[11px] text-[#cbd5e1] mt-0.5">Faculty of Technology · ICT 1108</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}