import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const DASHBOARD_STORAGE_KEY = '@smart_finance_dashboard_data_v3';

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [totalSpentWeek, setTotalSpentWeek] = useState(0);

  const filters = ['All', 'Food', 'Transport', 'Study'];

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      const saved = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const activities = parsed.recentActivity || [];
        setTransactions(activities);

        // සතියේ මුළු වියදම ගණනය කිරීම
        const expSum = activities
          .filter((tx) => tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        setTotalSpentWeek(expSum);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === 'All') return true;
    return tx.category === selectedFilter;
  });

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          totalSpentWeek > 0 ? totalSpentWeek : 0, // අද දිනට වියදම් එකතුව
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(65, 67, 213, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    barPercentage: 0.55,
    fillShadowGradient: '#4143d5',
    fillShadowGradientOpacity: 1,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#f1f5f9',
    },
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-8" />
          <Text className="text-lg font-bold text-[#4143d5]">History</Text>
          <View className="w-8" />
        </View>

        {/* Weekly Header Summary */}
        <View className="items-center my-3">
          <Text className="text-3xl font-extrabold text-[#0f172a]">
            Rs {totalSpentWeek.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Spent in this week · {transactions.length} transactions
          </Text>
        </View>

        {/* Weekly Bar Chart */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] mb-4 items-center">
          <Text className="text-xs font-bold text-[#0f172a] self-start mb-2 px-1">
            Weekly Spending Trend
          </Text>
          <BarChart
            data={barData}
            width={screenWidth - 56}
            height={160}
            yAxisLabel="Rs "
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={false}
            fromZero={true}
          />
        </View>

        {/* Filter Chips */}
        <View className="flex-row gap-2 mb-4">
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`px-5 py-2 rounded-full ${
                  isSelected ? 'bg-[#4143d5]' : 'bg-[#e2e8f0]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-[#f1f5f9] shadow-sm my-2">
            <View className="w-14 h-14 rounded-2xl bg-[#ede9fe] items-center justify-center mb-3">
              <Ionicons name="receipt-outline" size={26} color="#4143d5" />
            </View>
            <Text className="text-sm font-bold text-[#0f172a]">No Transactions Found</Text>
            <Text className="text-xs text-[#94a3b8] text-center mt-1">
              Logged transactions will show up here.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-2.5 flex-row justify-between items-center border border-[#f1f5f9] shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-[#f1f5f9] items-center justify-center mr-3">
                  <Ionicons name={item.icon || 'receipt'} size={18} color="#4143d5" />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-[#0f172a]">{item.title}</Text>
                  <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                </View>
              </View>
              <Text
                className={`text-xs font-bold ${
                  item.amount < 0 ? 'text-[#ef4444]' : 'text-[#16a34a]'
                }`}
              >
                {item.amount < 0 ? `- Rs ${Math.abs(item.amount)}` : `+ Rs ${item.amount}`}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}