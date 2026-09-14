import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const DASHBOARD_STORAGE_KEY = '@smart_finance_dashboard_data_v3';

const CATEGORY_COLORS = {
  Food: '#4143d5',
  Boarding: '#10b981',
  Transport: '#ef4444',
  Study: '#a855f7',
  Other: '#64748b',
};

const CATEGORIES = ['All', 'Food', 'Transport', 'Study', 'Boarding', 'Other'];

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // සතියේ දින 7 සඳහා වියදම් State
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadHistoryData();
    }, [])
  );

  const loadHistoryData = async () => {
    try {
      const dataStr = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        const allTx = parsed.recentActivity || [];
        setTransactions(allTx);
        calculateWeeklyTrend(allTx);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // සතියේ දින (Mon - Sun) අනුව වියදම් ගණනය කිරීම
  const calculateWeeklyTrend = (allTx) => {
    const dayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    let totalSpentWeek = 0;
    let countWeek = 0;

    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    allTx.forEach((tx) => {
      if (tx.amount < 0) {
        const expense = Math.abs(tx.amount);
        totalSpentWeek += expense;
        countWeek += 1;

        // Transaction එක දැමූ දිනය ලබා ගැනීම
        const txDate = tx.id && !isNaN(parseInt(tx.id)) ? new Date(parseInt(tx.id)) : new Date();
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

  // Transaction එකක් Delete කර Data නැවත ගණනය කිරීම
  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to remove this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const dataStr = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
              if (!dataStr) return;

              let data = JSON.parse(dataStr);
              const txToDelete = data.recentActivity.find((t) => t.id === id);
              if (!txToDelete) return;

              if (txToDelete.amount > 0) {
                data.income -= txToDelete.amount;
                data.balance -= txToDelete.amount;
              } else {
                data.expenses -= Math.abs(txToDelete.amount);
                data.balance += Math.abs(txToDelete.amount);
              }

              data.recentActivity = data.recentActivity.filter((t) => t.id !== id);

              const expenseActivities = data.recentActivity.filter((t) => t.amount < 0);
              const totalExp = expenseActivities.reduce((acc, t) => acc + Math.abs(t.amount), 0);

              const catTotals = { Food: 0, Boarding: 0, Transport: 0, Study: 0, Other: 0 };
              expenseActivities.forEach((t) => {
                const cat = t.category || 'Other';
                catTotals[cat] = (catTotals[cat] || 0) + Math.abs(t.amount);
              });

              data.breakdown = Object.keys(catTotals).map((cat) => ({
                label: cat,
                percent: totalExp > 0 ? Math.round((catTotals[cat] / totalExp) * 100) : 0,
                color: CATEGORY_COLORS[cat] || '#64748b',
              }));

              data.chartData = Object.keys(catTotals)
                .filter((cat) => catTotals[cat] > 0)
                .map((cat) => ({
                  name: cat,
                  population: catTotals[cat],
                  color: CATEGORY_COLORS[cat] || '#64748b',
                  legendFontColor: '#475569',
                  legendFontSize: 12,
                }));

              await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
              setTransactions(data.recentActivity);
              calculateWeeklyTrend(data.recentActivity);
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  // Filtered transactions
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
        {/* Header Section */}
        <View className="items-center mb-4">
          <Text className="text-base font-bold text-[#4143d5]">History</Text>
          <Text className="text-3xl font-extrabold text-[#0f172a] my-1">
            Rs {weeklyTotal.toLocaleString()}
          </Text>
          <Text className="text-xs text-[#64748b]">
            Spent in this week · {weeklyCount} transactions
          </Text>
        </View>

        {/* Weekly Spending Trend Chart */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] mb-4">
          <Text className="text-xs font-bold text-[#0f172a] mb-2 px-1">
            Weekly Spending Trend
          </Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: weeklyData }],
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

        {/* Category Pills */}
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

        {/* Transaction Items */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-[#f1f5f9] shadow-xs">
            <View className="w-12 h-12 rounded-2xl bg-[#ede9fe] items-center justify-center mb-2">
              <Ionicons name="receipt-outline" size={24} color="#4143d5" />
            </View>
            <Text className="text-xs font-bold text-[#0f172a] mt-1">No Transactions Found</Text>
            <Text className="text-[11px] text-[#94a3b8] mt-0.5">
              Logged transactions will show up here.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center bg-white p-3.5 rounded-2xl mb-2.5 border border-[#f1f5f9] shadow-xs"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-2xl bg-[#f1f5f9] items-center justify-center mr-3">
                  <Ionicons name={item.icon || 'receipt'} size={18} color="#4143d5" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-semibold text-[#0f172a]" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Text
                  className={`text-xs font-bold ${
                    item.amount < 0 ? 'text-[#ef4444]' : 'text-[#16a34a]'
                  }`}
                >
                  {item.amount < 0 ? `- Rs ${Math.abs(item.amount)}` : `+ Rs ${item.amount}`}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteTransaction(item.id)}
                  activeOpacity={0.7}
                  className="w-7 h-7 rounded-full bg-red-50 items-center justify-center border border-red-100"
                >
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}