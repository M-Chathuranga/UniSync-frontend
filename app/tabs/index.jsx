import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Animated,
  Easing,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

const screenWidth = Dimensions.get('window').width;

const AUTH_USER_KEY = '@smart_finance_auth_user';
const GROQ_API_KEY = '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';

// Calculate current date details
const getLiveDateInfo = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const monthStr = now.toLocaleDateString('en-US', { month: 'short' });
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, totalDaysInMonth - now.getDate());
  return { dateStr, monthStr, daysLeft };
};

const initialFinanceState = {
  income: 0,
  expenses: 0,
  balance: 0,
  safeDailyLimit: 0,
  isOverBudget: false,
  chartData: [],
  breakdown: [
    { label: 'Food', percent: 0, color: '#4143d5' },
    { label: 'Boarding', percent: 0, color: '#10b981' },
    { label: 'Transport', percent: 0, color: '#ef4444' },
    { label: 'Study', percent: 0, color: '#a855f7' },
    { label: 'Medical', percent: 0, color: '#ec4899' },
    { label: 'Other', percent: 0, color: '#64748b' },
  ],
  recentActivity: [],
};

const CATEGORY_COLORS = {
  Food: '#4143d5',
  Boarding: '#10b981',
  Transport: '#ef4444',
  Study: '#a855f7',
  Medical: '#ec4899',
  Other: '#64748b',
};

const ALL_CATEGORIES = [
  { name: 'Food', icon: 'restaurant' },
  { name: 'Transport', icon: 'bus' },
  { name: 'Boarding', icon: 'home' },
  { name: 'Study', icon: 'book' },
  { name: 'Medical', icon: 'medkit' },
  { name: 'Other', icon: 'receipt' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const [dateInfo, setDateInfo] = useState(getLiveDateInfo());
  const [userProfile, setUserProfile] = useState({ name: 'User', email: '' });
  const [financeData, setFinanceData] = useState(initialFinanceState);

  // Open Voice or Manual modal from bottom center FAB menu
  useEffect(() => {
    if (params?.action === 'voice') {
      setShowVoiceModal(true);
    } else if (params?.action === 'manual') {
      setShowManualModal(true);
    }
  }, [params?.action, params?.t]);

  // Reload data when dashboard screen gains focus
  useFocusEffect(
    useCallback(() => {
      setDateInfo(getLiveDateInfo());
      loadUserSession();
      loadFinanceData();
    }, [])
  );

  // Load user session from AsyncStorage
  const loadUserSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error loading session', e);
    }
  };

  // Load financial state from API and send budget alert to Notifications panel
  const loadFinanceData = async () => {
    try {
      const [dashRes, expRes, catSummaryRes] = await Promise.all([
        api.getDashboard(),
        api.getExpenses(),
        api.getCategorySummary(),
      ]);

      const totalCategorySpent = catSummaryRes.data.reduce((sum, c) => sum + c.totalAmount, 0);

      const getIconForCategory = (cat) => {
        if (cat === 'Food') return 'restaurant';
        if (cat === 'Transport') return 'bus';
        if (cat === 'Boarding') return 'home';
        if (cat === 'Study') return 'book';
        if (cat === 'Medical') return 'medkit';
        return 'receipt';
      };

      setFinanceData({
        income: dashRes.monthlyAllowance || 0,
        expenses: dashRes.totalSpentToday || 0,
        balance: dashRes.remainingDailyBalance || 0,
        safeDailyLimit: dashRes.safeDailyLimit || 0,
        isOverBudget: dashRes.isOverBudget || false,
        chartData: catSummaryRes.data.map((c) => ({
          name: c.category,
          population: c.totalAmount,
          color: CATEGORY_COLORS[c.category] || '#64748b',
          legendFontColor: '#475569',
          legendFontSize: 12,
        })),
        breakdown: catSummaryRes.data.map((c) => ({
          label: c.category,
          percent: totalCategorySpent > 0 ? Math.round((c.totalAmount / totalCategorySpent) * 100) : 0,
          color: CATEGORY_COLORS[c.category] || '#64748b',
        })),
        recentActivity: expRes.slice(0, 10).map((tx) => ({
          id: tx._id,
          title: tx.title,
          sub: `${tx.category} · ${new Date(tx.date).toLocaleDateString()}`,
          amount: -tx.amount,
          category: tx.category,
          icon: getIconForCategory(tx.category),
        })),
      });

    } catch (e) {
      console.error('Error loading finance data from API:', e);
    }
  };

  // Reset all expenses and budget data to Rs 0
  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all recorded expenses and reset your monthly allowance to Rs 0. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              const allExpenses = await api.getExpenses();

              if (Array.isArray(allExpenses) && allExpenses.length > 0) {
                await Promise.all(allExpenses.map((tx) => api.deleteExpense(tx._id)));
              }

              await api.updateSettings({ monthlyAllowance: 0 });
              const todayKey = `@budget_alert_sent_${new Date().toDateString()}`;
              await AsyncStorage.removeItem(todayKey);

              setFinanceData(initialFinanceState);
              await loadFinanceData();

              Alert.alert('Reset Complete', 'All expenses and budget data have been reset to Rs 0.');
            } catch (e) {
              console.error('Error resetting data:', e);
              Alert.alert('Error', 'Failed to reset all data. Please check your connection.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const safeToSpend = financeData.safeDailyLimit || 0;

  // Add new transaction (Expense or Income)
  const handleAddNewTransaction = async (newTx) => {
    try {
      if (newTx.type === 'expense') {
        await api.addExpense({
          title: newTx.title,
          amount: newTx.amount,
          category: newTx.category,
        });
      } else if (newTx.type === 'income') {
        const currentIncome = Number(financeData.income) || 0;
        const updatedIncome = currentIncome + Number(newTx.amount);
        await api.updateSettings({ monthlyAllowance: updatedIncome });
      }
      await loadFinanceData();
    } catch (e) {
      console.error('Error adding transaction', e);
      Alert.alert('Error', 'Failed to save transaction to server');
    }
  };

  // Delete single transaction with confirmation
  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteExpense(id);
              loadFinanceData();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  // Save edited transaction
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      await api.updateExpense(id, updatedData);
      setEditingTx(null);
      loadFinanceData();
    } catch (e) {
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const chartConfig = {
    color: (opacity = 1) => `rgba(65, 67, 213, ${opacity})`,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Header */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-[#0f172a]">Smart Finance</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleResetAllData}
              disabled={isResetting}
              activeOpacity={0.8}
              className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-200"
            >
              {isResetting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="refresh" size={16} color="#ef4444" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/tabs/settings')}
              activeOpacity={0.8}
              className="w-12 h-12 rounded-full bg-[#ede9fe] items-center justify-center border border-[#c7d2fe]"
            >
              <Text className="text-[#4143d5] font-bold text-lg">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting */}
        <Text className="text-2xl font-bold text-[#0f172a]">
          Hello, {userProfile.firstName || userProfile.name || 'Admin'} 👋
        </Text>
        <Text className="text-xs text-[#64748b] mt-0.5 mb-4">{dateInfo.dateStr}</Text>

        {/* Safe To Spend Banner */}
        <View className="bg-[#f0fdf4] rounded-3xl p-5 flex-row justify-between items-center border border-[#dcfce7] mb-4">
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#16a34a] tracking-wider">
              SAFE TO SPEND TODAY
            </Text>
            <Text className="text-3xl font-extrabold text-[#15803d] my-1">
              Rs {Number(safeToSpend).toFixed(2)}
            </Text>
            <Text className="text-xs font-medium text-[#16a34a]">
              • {dateInfo.daysLeft} days left in {dateInfo.monthStr}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#94a3b8] items-center justify-center">
            <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
          </View>
        </View>

        {/* Summary Metric Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#dcfce7] items-center justify-center mb-1">
              <Ionicons name="arrow-down" size={14} color="#16a34a" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Income</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.income.toLocaleString()}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#fee2e2] items-center justify-center mb-1">
              <Ionicons name="arrow-up" size={14} color="#ef4444" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Expenses</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.expenses.toLocaleString()}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#e0e7ff] items-center justify-center mb-1">
              <Ionicons name="wallet" size={14} color="#4338ca" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Balance</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.balance.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Breakdown Card */}
        <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-[#f1f5f9]">
          <Text className="text-sm font-bold text-[#0f172a] mb-2">Spending Breakdown</Text>

          {financeData.expenses === 0 || !financeData.chartData || financeData.chartData.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Ionicons name="pie-chart-outline" size={44} color="#cbd5e1" />
              <Text className="text-xs font-bold text-[#94a3b8] mt-2">No expenses recorded yet</Text>
              <Text className="text-[11px] text-[#cbd5e1] mt-0.5">Breakdown chart is reset to Rs 0</Text>
            </View>
          ) : (
            <>
              <View className="items-center">
                <PieChart
                  data={financeData.chartData}
                  width={screenWidth - 56}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="10"
                  absolute
                />
              </View>

              <View className="mt-2">
                {financeData.breakdown.map((item) => (
                  <View key={item.label} className="mb-2.5">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs font-medium text-[#334155]">{item.label}</Text>
                      <Text className="text-xs font-semibold text-[#0f172a]">{item.percent}%</Text>
                    </View>
                    <View className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <View
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                        className="h-full rounded-full"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Recent Transactions List with Edit & Delete Buttons */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-bold text-[#0f172a]">Recent Activity</Text>
            {financeData.recentActivity.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/tabs/history')}>
                <Text className="text-xs font-semibold text-[#4143d5]">See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {financeData.recentActivity.length === 0 ? (
            <View className="py-6 items-center justify-center">
              <Ionicons name="receipt-outline" size={32} color="#cbd5e1" />
              <Text className="text-xs text-[#94a3b8] mt-1.5">No recent transactions</Text>
            </View>
          ) : (
            financeData.recentActivity.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-2.5 border-b border-[#f8fafc] last:border-b-0"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-2xl bg-[#f1f5f9] items-center justify-center mr-3">
                    <Ionicons name={item.icon || 'receipt'} size={18} color="#4143d5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-[#0f172a]" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={`text-xs font-bold mr-1 ${
                      item.amount < 0 ? 'text-[#ef4444]' : 'text-[#16a34a]'
                    }`}
                  >
                    {item.amount < 0 ? `- Rs ${Math.abs(item.amount)}` : `+ Rs ${item.amount}`}
                  </Text>

                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() =>
                      setEditingTx({
                        id: item.id,
                        title: item.title,
                        amount: Math.abs(item.amount).toString(),
                        category: item.category,
                      })
                    }
                    className="w-7 h-7 rounded-full bg-indigo-50 items-center justify-center"
                  >
                    <Ionicons name="pencil" size={14} color="#4143d5" />
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => handleDeleteTransaction(item.id)}
                    className="w-7 h-7 rounded-full bg-red-50 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <InternalVoiceModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onAddExpense={() => loadFinanceData()}
      />

      <ManualAddModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onAddTransaction={handleAddNewTransaction}
      />

      <EditExpenseModal
        visible={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={handleUpdateTransaction}
      />
    </SafeAreaView>
  );
}

// Manual Transaction Entry Modal
function ManualAddModal({ visible, onClose, onAddTransaction }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid title and amount.');
      return;
    }

    const catObj = ALL_CATEGORIES.find((c) => c.name === selectedCategory) || { icon: 'receipt' };

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      icon: type === 'income' ? 'wallet' : catObj.icon,
      type: type,
    });

    setTitle('');
    setAmount('');
    setType('expense');
    setSelectedCategory('Food');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] max-h-[88%]">
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
            >
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

              <Text className="text-lg font-bold text-[#0f172a] mb-3">Add Transaction</Text>

              <View className="flex-row bg-[#f1f5f9] p-1 rounded-2xl mb-4">
                <TouchableOpacity
                  onPress={() => setType('expense')}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    type === 'expense' ? 'bg-[#ef4444]' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold ${type === 'expense' ? 'text-white' : 'text-[#64748b]'}`}>
                    Expense
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setType('income')}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    type === 'income' ? 'bg-[#16a34a]' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold ${type === 'income' ? 'text-white' : 'text-[#64748b]'}`}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-semibold text-[#64748b] mb-1">Title / Description</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={type === 'expense' ? 'e.g. Canteen lunch' : 'e.g. Monthly Allowance'}
                placeholderTextColor="#94a3b8"
                className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-3"
              />

              <Text className="text-xs font-semibold text-[#64748b] mb-1">Amount (Rs)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-4"
              />

              {type === 'expense' && (
                <>
                  <Text className="text-xs font-semibold text-[#64748b] mb-2">Category</Text>
                  <View className="flex-row flex-wrap gap-2 mb-5">
                    {ALL_CATEGORIES.map((c) => {
                      const isSelected = selectedCategory === c.name;
                      return (
                        <TouchableOpacity
                          key={c.name}
                          onPress={() => setSelectedCategory(c.name)}
                          className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                            isSelected
                              ? 'bg-[#4143d5] border-[#4143d5]'
                              : 'bg-[#f8fafc] border-gray-200'
                          }`}
                        >
                          <Ionicons
                            name={c.icon}
                            size={14}
                            color={isSelected ? '#ffffff' : '#64748b'}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-white' : 'text-[#64748b]'
                            }`}
                          >
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
                >
                  <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center shadow-md shadow-[#4143d5]/30"
                >
                  <Text className="text-xs font-bold text-white">Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
// Edit Expense Modal Component
function EditExpenseModal({ visible, transaction, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || '');
      setAmount(transaction.amount ? String(transaction.amount) : '');
      setSelectedCategory(transaction.category || 'Food');
    }
  }, [transaction]);

  const handleUpdate = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid title and amount.');
      return;
    }
    onSave(transaction.id, {
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-white rounded-t-[32px] px-6 pt-5 pb-9">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-lg font-bold text-[#0f172a] mb-3">Edit Expense</Text>

          <Text className="text-xs font-semibold text-[#64748b] mb-1">Title / Description</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-3"
          />

          <Text className="text-xs font-semibold text-[#64748b] mb-1">Amount (Rs)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-4"
          />

          <Text className="text-xs font-semibold text-[#64748b] mb-2">Category</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {ALL_CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c.name;
              return (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => setSelectedCategory(c.name)}
                  className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                    isSelected ? 'bg-[#4143d5] border-[#4143d5]' : 'bg-[#f8fafc] border-gray-200'
                  }`}
                >
                  <Ionicons
                    name={c.icon}
                    size={14}
                    color={isSelected ? '#ffffff' : '#64748b'}
                    style={{ marginRight: 4 }}
                  />
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#64748b]'}`}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
            >
              <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdate}
              className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center shadow-md shadow-[#4143d5]/30"
            >
              <Text className="text-xs font-bold text-white">Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Voice Assistant Modal with Multi-Language & Medical Category Support
function InternalVoiceModal({ visible, onClose, onAddExpense }) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [detectedExpense, setDetectedExpense] = useState(null);

  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim1, {
              toValue: 1.45,
              duration: 800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim1, {
              toValue: 1,
              duration: 800,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.7,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 1000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (visible) {
      setSpokenText('');
      setDetectedExpense(null);
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [visible]);

  const startAudioRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Microphone permission is required to record voice.');
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      setSpokenText('');
      setDetectedExpense(null);

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start error', err);
      Alert.alert('Microphone Error', 'Could not open microphone for recording.');
    }
  };

  const stopAudioRecordingAndTranscribe = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      await audioRecorder.stop();
      const rawUri = audioRecorder.uri;

      if (!rawUri) {
        setIsProcessing(false);
        Alert.alert('Recording Notice', 'No audio was captured. Please speak again.');
        return;
      }

      const fileUri =
        rawUri.startsWith('file://') || rawUri.startsWith('content://')
          ? rawUri
          : `file://${rawUri}`;

      const uploadResult = await FileSystem.uploadAsync(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        fileUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType: 'audio/m4a',
          parameters: {
            model: 'whisper-large-v3',
            prompt:
              'Sri Lanka student expense tracker (English, Sinhala, Singlish): PickMe, Uber, tuk, bus fare, kottu, rice, tea, canteen, photocopy, print, boarding, bodima, rent, medical, medicine, pharmacy, doctor, hospital, Rs.',
          },
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
          },
        }
      );

      setIsProcessing(false);

      if (uploadResult && (uploadResult.status === 200 || uploadResult.status === 201) && uploadResult.body) {
        const result = JSON.parse(uploadResult.body);
        if (result.text) {
          parseExpense(result.text);
        } else {
          Alert.alert('Recognition Failed', 'Could not detect speech in audio.');
        }
      } else {
        Alert.alert('AI Speech Error', 'Could not transcribe audio. Please try again.');
      }
    } catch (err) {
      setIsProcessing(false);
      console.error('Transcription error', err);
      Alert.alert('Upload Error', err?.message || 'Failed to upload audio to speech service.');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioRecordingAndTranscribe();
    } else {
      startAudioRecording();
    }
  };

  // Parse amount and category from English, Sinhala, or Singlish text
  const parseExpense = (text) => {
    setSpokenText(text);
    const clean = text.toLowerCase();

    const numberRemovedCommas = clean.replace(/(\d),(\d)/g, '$1$2');
    const match = numberRemovedCommas.match(/(?:rs\.?|rupees)?\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = match ? parseFloat(match[1]) : 0;

    let category = 'Other';
    let icon = 'receipt';

    const foodRegex =
      /(lunch|canteen|food|tea|dinner|breakfast|snack|rice|coffee|kottu|meal|bread|roll|bun|burger|pizza|shorteats|short eats|juice|milk|water|cake|biscuit|hopper|string hopper|parotta|roti|fried rice|biryani|noodles|bath|kema|kama|the|kiri|appa|indiappa|\u0db6\u0dad\u0dca|\u0d9a\u0dd1\u0db8|\u0dad\u0dda|\u0d9a\u0ddc\u0dad\u0dca\u0dad\u0dd4|\u0d86\u0db4\u0dca\u0db4|\u0dbb\u0ddc\u0da7\u0dd2|\u0d9a\u0dd0\u0db1\u0dca\u0da7\u0dd2\u0db1\u0dca|\u0d9a\u0dd2\u0dbb\u0dd2|\u0db6\u0dd2\u0dc3\u0dca\u0d9a\u0da7\u0dca|\u0db4\u0dcf\u0db1\u0dca|\u0db6\u0db1\u0dd2\u0dc3\u0dca)/i;

    const transportRegex =
      /(bus|transit|train|ticket|uber|pickme|pick me|pikme|fuel|petrol|diesel|van|ride|tuk|three wheel|threewheel|3wheel|wheel|auto|taxi|bike|fare|hire|sticket|\u0db6\u0dc3\u0dca|\u0d9a\u0ddd\u0da0\u0dca\u0da0\u0dd2|\u0daf\u0dd4\u0db8\u0dca\u0dbb\u0dd2\u0dba|\u0dad\u0dca\u200d\u0dbb\u0dd3\u0dc0\u0dd3\u0dbd\u0dca|\u0dc0\u0dd3\u0dbd\u0dca|\u0db4\u0dd2\u0d9a\u0dca\u0db8\u0dd3|\u0d8b\u0db6\u0dbb\u0dca|\u0db4\u0dd9\u0da7\u0dca\u200d\u0dbb\u0dbd\u0dca|\u0d9c\u0db8\u0db1\u0dca)/i;

    const boardingRegex =
      /(boarding|boardin|rent|room|hostel|bodim|bodima|boodima|electricity|water bill|bill|wifi|internet|data|reload|card|\u0db6\u0ddd\u0da9\u0dd2\u0db8|\u0db6\u0ddd\u0da9\u0dd2\u0d82|\u0d9a\u0dcf\u0db8\u0dbb|\u0d9a\u0dd4\u0dbd\u0dd3|\u0db6\u0dd2\u0dbd\u0dca|\u0dbb\u0dd3\u0dbd\u0ddd\u0da9\u0dca|\u0da9\u0dda\u0da7\u0dcf)/i;

    const studyRegex =
      /(book|study|photocopy|photo copy|pen|pencil|print|printout|exam|class|tuition|note|lecture|paper|file|stationery|uni|campus|course|\u0db4\u0ddc\u0dad\u0dca|\u0db4\u0ddc\u0dad|\u0db4\u0dd1\u0db1\u0dca|\u0dc6\u0ddc\u0da7\u0ddd\u0d9a\u0ddc\u0db4\u0dd2|\u0db4\u0dca\u200d\u0dbb\u0dd2\u0db1\u0dca\u0da7\u0dca|\u0db4\u0db1\u0dca\u0dad\u0dd2|\u0d9a\u0dd0\u0db8\u0dca\u0db4\u0dc3\u0dca|\u0db1\u0ddd\u0da7\u0dca)/i;

    const medicalRegex =
      /(medical|medicine|doctor|hospital|pharmacy|clinic|tablet|pill|checkup|dental|eye|health|beheth|dosthara|rohal|\u0db6\u0dd9\u0dc4\u0dd9\u0dad\u0dca|\u0daf\u0ddc\u0dc3\u0dca\u0dad\u0dbb|\u0dbb\u0ddd\u0dc4\u0dbd\u0dca|\u0dc6\u0dcf\u0db8\u0dc3\u0dd2|\u0db8\u0dd9\u0da9\u0dd2\u0d9a\u0dbd\u0dca)/i;

    if (foodRegex.test(clean)) {
      category = 'Food';
      icon = 'restaurant';
    } else if (transportRegex.test(clean)) {
      category = 'Transport';
      icon = 'bus';
    } else if (boardingRegex.test(clean)) {
      category = 'Boarding';
      icon = 'home';
    } else if (studyRegex.test(clean)) {
      category = 'Study';
      icon = 'book';
    } else if (medicalRegex.test(clean)) {
      category = 'Medical';
      icon = 'medkit';
    }

    const cleanTitle = text
      .replace(/(\d),(\d)/g, '$1$2')
      .replace(/(?:rs\.?|rupees)?\s*\d+(?:\.\d{1,2})?/gi, '')
      .replace(/[-,.]/g, ' ')
      .trim();

    if (amount > 0) {
      setDetectedExpense({
        title: cleanTitle.length > 1 ? cleanTitle : `${category} Expense`,
        amount: amount,
        category: category,
        icon: icon,
      });
    } else {
      setDetectedExpense(null);
    }
  };

  const changeDetectedCategory = (catName, catIcon) => {
    if (detectedExpense) {
      setDetectedExpense({
        ...detectedExpense,
        category: catName,
        icon: catIcon,
      });
    }
  };

  const handleSave = async () => {
    if (detectedExpense) {
      try {
        await api.addExpense({
          title: detectedExpense.title,
          amount: detectedExpense.amount,
          category: detectedExpense.category,
        });
        onAddExpense();
        onClose();
      } catch (e) {
        Alert.alert('Error', 'Backend failed to save expense.');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[36px] px-6 pt-6 pb-10 items-center shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />

          <Text className="text-xl font-extrabold text-[#0f172a]">AI Voice Assistant</Text>
          <Text className="text-xs text-[#64748b] mt-1 mb-3 text-center">
            {isRecording
              ? 'Listening (English / Sinhala)... Tap to stop'
              : isProcessing
              ? 'Transcribing with Groq AI...'
              : 'Speak in English, Sinhala or Singlish'}
          </Text>

          <View className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-2.5 my-2 flex-row items-center">
            <Ionicons name="mic-circle" size={26} color="#4143d5" />
            <TextInput
              placeholder="e.g. PickMe 350, Medical 2000, Bus 120"
              placeholderTextColor="#94a3b8"
              value={spokenText}
              onChangeText={(text) => parseExpense(text)}
              className="flex-1 ml-2 text-xs text-[#0f172a]"
            />
            {spokenText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSpokenText('');
                  setDetectedExpense(null);
                }}
              >
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <View className="items-center justify-center my-3 h-28 w-28">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim2 }],
                opacity: pulseAnim2.interpolate({ inputRange: [1, 1.7], outputRange: [0.35, 0] }),
              }}
              className="absolute w-28 h-28 rounded-full bg-[#4143d5]"
            />
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim1 }],
                opacity: pulseAnim1.interpolate({ inputRange: [1, 1.45], outputRange: [0.5, 0.05] }),
              }}
              className="absolute w-20 h-20 rounded-full bg-[#818cf8]"
            />
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={isProcessing}
              onPress={toggleRecording}
              className={`w-16 h-16 rounded-full items-center justify-center shadow-lg border-2 border-white ${
                isRecording ? 'bg-[#ef4444]' : 'bg-[#4143d5]'
              }`}
              style={{ elevation: 10 }}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={28} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>

          {detectedExpense && (
            <View className="w-full my-1">
              <View className="w-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-[#d1fae5] items-center justify-center mr-3">
                    <Ionicons name={detectedExpense.icon} size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#065f46]">{detectedExpense.category}</Text>
                    <Text className="text-[11px] text-gray-500" numberOfLines={1}>
                      {detectedExpense.title}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-extrabold text-[#047857]">
                  - Rs {detectedExpense.amount.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-1.5 mt-2 justify-center">
                {ALL_CATEGORIES.map((c) => {
                  const active = detectedExpense.category === c.name;
                  return (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => changeDetectedCategory(c.name, c.icon)}
                      className={`px-2.5 py-1 rounded-full border ${
                        active ? 'bg-[#4143d5] border-[#4143d5]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text className={`text-[10px] font-bold ${active ? 'text-white' : 'text-gray-600'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-2 self-start">
            Quick Examples:
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3 w-full">
            {['PickMe 350', 'Medical 2000', 'Photocopy 120', 'Boarding 8000'].map((sample) => (
              <TouchableOpacity
                key={sample}
                onPress={() => parseExpense(sample)}
                className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs"
              >
                <Text className="text-xs text-[#4143d5] font-medium">{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3 w-full mt-1">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3 rounded-2xl items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#475569]">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!detectedExpense}
              className={`flex-1 py-3 rounded-2xl items-center justify-center shadow-md ${
                detectedExpense ? 'bg-[#4143d5]' : 'bg-gray-300'
              }`}
            >
              <Text className="text-xs font-bold text-white">Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}