import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { api } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

// Category color map for UI consistency
const CATEGORY_COLORS = {
  Food: '#4143d5',
  Boarding: '#10b981',
  Transport: '#ef4444',
  Study: '#a855f7',
  Other: '#64748b',
  Medical: '#ec4899',
};

// Filter categories for pill selector
const CATEGORIES = ['All', 'Food', 'Transport', 'Study', 'Boarding', 'Medical', 'Other'];

const EDITABLE_CATEGORIES = [
  { name: 'Food', icon: 'restaurant' },
  { name: 'Transport', icon: 'bus' },
  { name: 'Boarding', icon: 'home' },
  { name: 'Study', icon: 'book' },
  { name: 'Medical', icon: 'medkit' },
  { name: 'Other', icon: 'receipt' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HistoryScreen() {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = now.getFullYear();

  const [allTransactions, setAllTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingTx, setEditingTx] = useState(null);

  // Period filter state: 'current' | 'year' | 'YYYY-MM'
  const [periodMode, setPeriodMode] = useState('current');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Re-load expense data every time this tab gets focus
  useFocusEffect(
    useCallback(() => {
      loadHistoryData();
    }, [])
  );

  // Fetch all expenses from backend API
  const loadHistoryData = async () => {
    try {
      const expenses = await api.getExpenses();

      const mapped = (Array.isArray(expenses) ? expenses : []).map((tx) => {
        const d = new Date(tx.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return {
          id: tx._id,
          title: tx.title,
          sub: `${tx.category} · ${d.toLocaleDateString()}`,
          amount: -tx.amount,
          category: tx.category,
          icon: getIconForCategory(tx.category),
          dateTimestamp: d.getTime(),
          monthKey,
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
        };
      });

      setAllTransactions(mapped);
    } catch (e) {
      console.error('Error loading history from API:', e);
    }
  };

  // Map category name to Ionicons icon name
  const getIconForCategory = (cat) => {
    if (cat === 'Food') return 'restaurant';
    if (cat === 'Transport') return 'bus';
    if (cat === 'Boarding') return 'home';
    if (cat === 'Study') return 'book';
    if (cat === 'Medical') return 'medkit';
    return 'receipt';
  };

  // Build selectable list of past months (all months of current year up to current month + any older months with data)
  const availableMonths = useMemo(() => {
    const map = new Map();

    // Include months from Jan to current month of this year
    for (let m = now.getMonth(); m >= 0; m--) {
      const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      map.set(key, `${MONTH_NAMES[m]} ${currentYear}`);
    }

    // Also include any older months found in database records
    allTransactions.forEach((tx) => {
      if (!map.has(tx.monthKey)) {
        map.set(tx.monthKey, `${MONTH_NAMES[tx.monthIndex]} ${tx.year}`);
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [allTransactions, currentYear]);

  // Filter transactions by selected period ('current', 'year', or specific 'YYYY-MM')
  const periodTransactions = useMemo(() => {
    if (periodMode === 'year') {
      return allTransactions.filter((tx) => tx.year === currentYear);
    }
    const targetMonthKey = periodMode === 'current' ? currentMonthKey : periodMode;
    return allTransactions.filter((tx) => tx.monthKey === targetMonthKey);
  }, [allTransactions, periodMode, currentMonthKey, currentYear]);

  // Calculate summary total, transaction count, and chart series for the active period
  const { periodTotal, periodCount, chartLabels, chartValues, periodTitle } = useMemo(() => {
    let total = 0;
    let count = 0;

    periodTransactions.forEach((tx) => {
      if (tx.amount < 0) {
        total += Math.abs(tx.amount);
        count += 1;
      }
    });

    // If viewing Full Year, show Jan-Dec monthly spending trend
    if (periodMode === 'year') {
      const monthlyTotals = new Array(12).fill(0);
      periodTransactions.forEach((tx) => {
        if (tx.amount < 0 && tx.monthIndex >= 0 && tx.monthIndex < 12) {
          monthlyTotals[tx.monthIndex] += Math.abs(tx.amount);
        }
      });

      return {
        periodTotal: total,
        periodCount: count,
        chartLabels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        chartValues: monthlyTotals.every((v) => v === 0)
          ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
          : monthlyTotals,
        periodTitle: `Year ${currentYear}`,
      };
    }

    // Otherwise show Mon-Sun spending trend for the selected month
    const dayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    periodTransactions.forEach((tx) => {
      if (tx.amount < 0) {
        const txDate = new Date(tx.dateTimestamp);
        const dayName = daysMap[txDate.getDay()];
        if (dayTotals[dayName] !== undefined) {
          dayTotals[dayName] += Math.abs(tx.amount);
        }
      }
    });

    const weekArr = [
      dayTotals.Mon,
      dayTotals.Tue,
      dayTotals.Wed,
      dayTotals.Thu,
      dayTotals.Fri,
      dayTotals.Sat,
      dayTotals.Sun,
    ];

    const activeMonthObj = availableMonths.find(
      (m) => m.key === (periodMode === 'current' ? currentMonthKey : periodMode)
    );

    return {
      periodTotal: total,
      periodCount: count,
      chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      chartValues: weekArr.every((v) => v === 0) ? [0, 0, 0, 0, 0, 0, 1] : weekArr,
      periodTitle: activeMonthObj ? activeMonthObj.label : `${MONTH_NAMES[now.getMonth()]} ${currentYear}`,
    };
  }, [periodTransactions, periodMode, availableMonths, currentMonthKey, currentYear]);

  // Delete an expense with confirmation prompt
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
              loadHistoryData();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  // Update an edited expense
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      await api.updateExpense(id, updatedData);
      setEditingTx(null);
      loadHistoryData();
    } catch (e) {
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  // Filter period transactions by search query and selected category pill
  const filteredTransactions = periodTransactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || tx.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary */}
        <View className="items-center mb-3">
          <Text className="text-base font-bold text-[#4143d5]">History · {periodTitle}</Text>
          <Text className="text-3xl font-extrabold text-[#0f172a] my-1">
            Rs {periodTotal.toLocaleString()}
          </Text>
          <Text className="text-xs text-[#64748b]">
            {periodTitle} · {periodCount} transactions
          </Text>
        </View>

        {/* Period Switcher Bar (Default: This Month; Optional: Full Year or Past Months) */}
        <View className="flex-row justify-center items-center gap-2 mb-3">
          <TouchableOpacity
            onPress={() => {
              setPeriodMode('current');
              setShowMonthPicker(false);
            }}
            className={`px-3.5 py-1.5 rounded-full border ${
              periodMode === 'current'
                ? 'bg-[#4143d5] border-[#4143d5]'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                periodMode === 'current' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setPeriodMode('year');
              setShowMonthPicker(false);
            }}
            className={`px-3.5 py-1.5 rounded-full border ${
              periodMode === 'year'
                ? 'bg-[#4143d5] border-[#4143d5]'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                periodMode === 'year' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Full Year ({currentYear})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMonthPicker((prev) => !prev)}
            className={`flex-row items-center px-3.5 py-1.5 rounded-full border ${
              periodMode !== 'current' && periodMode !== 'year'
                ? 'bg-[#4143d5] border-[#4143d5]'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-[11px] font-bold mr-1 ${
                periodMode !== 'current' && periodMode !== 'year' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              {periodMode !== 'current' && periodMode !== 'year' ? periodTitle : 'By Month'}
            </Text>
            <Ionicons
              name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={periodMode !== 'current' && periodMode !== 'year' ? '#ffffff' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        {/* Expandable Past Month Selector (Only shown when user taps "By Month") */}
        {showMonthPicker && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 bg-white p-2 rounded-2xl border border-[#e2e8f0]"
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {availableMonths.map((m) => {
              const isSelected =
                periodMode === m.key || (periodMode === 'current' && m.key === currentMonthKey);
              return (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => {
                    setPeriodMode(m.key === currentMonthKey ? 'current' : m.key);
                    setShowMonthPicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl mr-2 ${
                    isSelected ? 'bg-[#ede9fe]' : 'bg-[#f8fafc]'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isSelected ? 'text-[#4143d5]' : 'text-[#64748b]'
                    }`}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Spending Trend Line Chart */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] mb-4">
          <Text className="text-xs font-bold text-[#0f172a] mb-2 px-1">
            Spending Trend ({periodTitle})
          </Text>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartValues }],
            }}
            width={screenWidth - 64}
            height={160}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(65, 67, 213, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#4143d5',
              },
              propsForBackgroundLines: {
                strokeDasharray: '4',
                stroke: '#f1f5f9',
              },
            }}
            bezier
            style={{ marginVertical: 4, borderRadius: 16 }}
          />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3 py-2.5 mb-3 shadow-xs">
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder={`Search in ${periodTitle}...`}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-xs text-[#0f172a]"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isSelected
                    ? 'bg-[#4143d5] border-[#4143d5]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    isSelected ? 'text-white' : 'text-[#64748b]'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Transaction List with Edit & Delete Buttons */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-[#f1f5f9] shadow-xs">
            <View className="w-12 h-12 rounded-2xl bg-[#ede9fe] items-center justify-center mb-2">
              <Ionicons name="receipt-outline" size={24} color="#4143d5" />
            </View>
            <Text className="text-xs font-bold text-[#0f172a] mt-1">No Transactions Found</Text>
            <Text className="text-[11px] text-[#94a3b8] mt-0.5">
              No recorded expenses for {periodTitle}.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center bg-white p-3.5 rounded-2xl mb-2.5 border border-[#f1f5f9] shadow-xs"
            >
              {/* Left: icon + title + subtitle */}
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  style={{ backgroundColor: `${CATEGORY_COLORS[item.category] || '#64748b'}15` }}
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                >
                  <Ionicons
                    name={item.icon || 'receipt'}
                    size={18}
                    color={CATEGORY_COLORS[item.category] || '#64748b'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-[#0f172a]" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                </View>
              </View>

              {/* Right: amount + Edit & Delete buttons */}
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-bold text-[#ef4444] mr-1">
                  - Rs {Math.abs(item.amount)}
                </Text>

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
      </ScrollView>

      {/* Edit Expense Modal */}
      <EditHistoryExpenseModal
        visible={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={handleUpdateTransaction}
      />
    </SafeAreaView>
  );
}

// Edit Expense Modal Component
function EditHistoryExpenseModal({ visible, transaction, onClose, onSave }) {
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
            {EDITABLE_CATEGORIES.map((c) => {
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