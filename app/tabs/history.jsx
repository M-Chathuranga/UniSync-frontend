import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
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

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Weekly chart data (Mon–Sun totals)
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);

  // Re-load expense data every time this tab gets focus
  useFocusEffect(
    useCallback(() => {
      loadHistoryData();
    }, [])
  );

  // Fetch all expenses from the backend API for the logged-in user
  const loadHistoryData = async () => {
    try {
      const expenses = await api.getExpenses(); // GET /expenses → filtered by req.user.id

      // Map backend expense objects to UI-friendly transaction format
      const allTx = expenses.map(tx => ({
        id: tx._id,
        title: tx.title,
        sub: `${tx.category} · ${new Date(tx.date).toLocaleDateString()}`,
        amount: -tx.amount,        // Display as negative (expense)
        category: tx.category,
        icon: getIconForCategory(tx.category),
        dateTimestamp: new Date(tx.date).getTime(), // Used for weekly bucketing
      }));

      setTransactions(allTx);
      calculateWeeklyTrend(allTx);
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
    if (cat === 'Medical') return 'pricetag';
    return 'receipt';
  };

  // Calculate Mon–Sun spending totals and summary counts for the weekly chart
  const calculateWeeklyTrend = (allTx) => {
    const dayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let totalSpentWeek = 0;
    let countWeek = 0;

    allTx.forEach((tx) => {
      if (tx.amount < 0) {
        const expense = Math.abs(tx.amount);
        totalSpentWeek += expense;
        countWeek += 1;

        // Determine which day of the week this expense belongs to
        const txDate = new Date(tx.dateTimestamp);
        const dayName = daysMap[txDate.getDay()];
        if (dayTotals[dayName] !== undefined) {
          dayTotals[dayName] += expense;
        }
      }
    });

    setWeeklyTotal(totalSpentWeek);
    setWeeklyCount(countWeek);
    setWeeklyData([
      dayTotals.Mon,
      dayTotals.Tue,
      dayTotals.Wed,
      dayTotals.Thu,
      dayTotals.Fri,
      dayTotals.Sat,
      dayTotals.Sun,
    ]);
  };

  // Filter transactions by search query and selected category pill
  const filteredTransactions = transactions.filter((tx) => {
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
        <View className="items-center mb-4">
          <Text className="text-base font-bold text-[#4143d5]">History</Text>
          <Text className="text-3xl font-extrabold text-[#0f172a] my-1">
            Rs {weeklyTotal.toLocaleString()}
          </Text>
          <Text className="text-xs text-[#64748b]">
            All expenses · {weeklyCount} transactions
          </Text>
        </View>

        {/* Weekly Spending Trend Line Chart */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] mb-4">
          <Text className="text-xs font-bold text-[#0f172a] mb-2 px-1">
            Weekly Spending Trend
          </Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: weeklyData.every(d => d === 0) ? [0, 0, 0, 0, 0, 0, 1] : weeklyData }],
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
            placeholder="Search transactions..."
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

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-[#f1f5f9] shadow-xs">
            <View className="w-12 h-12 rounded-2xl bg-[#ede9fe] items-center justify-center mb-2">
              <Ionicons name="receipt-outline" size={24} color="#4143d5" />
            </View>
            <Text className="text-xs font-bold text-[#0f172a] mt-1">No Transactions Found</Text>
            <Text className="text-[11px] text-[#94a3b8] mt-0.5">
              Logged expenses will appear here.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center bg-white p-3.5 rounded-2xl mb-2.5 border border-[#f1f5f9] shadow-xs"
            >
              {/* Left: icon + title + subtitle */}
              <View className="flex-row items-center flex-1">
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
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-semibold text-[#0f172a]" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                </View>
              </View>

              {/* Right: amount */}
              <Text className="text-xs font-bold text-[#ef4444]">
                - Rs {Math.abs(item.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}