import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Food', 'Transport', 'Fixed'];

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [450, 680, 320, 890, 1250, 540, 730],
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
          <TouchableOpacity className="w-8">
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#4143d5]">History</Text>
          <TouchableOpacity className="w-8 items-end">
            <Ionicons name="settings-sharp" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="items-center my-3">
          <Text className="text-3xl font-extrabold text-[#0f172a]">Rs 4,860</Text>
          <Text className="text-xs text-gray-400 mt-1">Spent in this week · 24 transactions</Text>
        </View>

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
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        </View>

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

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          TODAY
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-4">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#f8fafc]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-[#fef2f2] items-center justify-center mr-3">
                <Text className="text-lg">🍽️</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Campus Cafe</Text>
                <Text className="text-[11px] text-gray-400">Food · 12:30 PM</Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-[#ef4444]">-Rs 200</Text>
          </View>

          <View className="flex-row justify-between items-center pt-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-[#ecfdf5] items-center justify-center mr-3">
                <Text className="text-lg">🚌</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">City Transit</Text>
                <Text className="text-[11px] text-gray-400">Transport · 08:15 AM</Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-[#ef4444]">-Rs 45</Text>
          </View>
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          YESTERDAY
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-4">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#f8fafc]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-[#f0fdf4] items-center justify-center mr-3">
                <Text className="text-lg">🛍️</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Stationery Store</Text>
                <Text className="text-[11px] text-gray-400">Supplies · 04:20 PM</Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-[#ef4444]">-Rs 350</Text>
          </View>

          <View className="flex-row justify-between items-center pt-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-[#fff7ed] items-center justify-center mr-3">
                <Text className="text-lg">☕</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-[#0f172a]">Library Coffee</Text>
                <Text className="text-[11px] text-gray-400">Food · 10:00 AM</Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-[#ef4444]">-Rs 120</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}