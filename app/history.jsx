import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const filters = ['All', 'Food', 'Transport', 'Fixed'];

const transactionGroups = [
  {
    date: 'TODAY · TUE 14',
    items: [
      { id: '1', name: 'Campus Cafe', category: 'Food', time: '12:30 PM', amount: 200, emoji: '🍽️', bgColor: '#FEF2F2' },
      { id: '2', name: 'City Transit', category: 'Transport', time: '08:15 AM', amount: 45, emoji: '🚌', bgColor: '#ECFDF5' },
    ],
  },
  {
    date: 'YESTERDAY · MON 13',
    items: [
      { id: '3', name: 'Stationery Store', category: 'Supplies', time: '04:20 PM', amount: 350, emoji: '🛍️', bgColor: '#EEF2FF' },
      { id: '4', name: 'Library Coffee', category: 'Food', time: '10:00 AM', amount: 120, emoji: '☕', bgColor: '#FEF2F2' },
    ],
  },
];

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: '#4F46E5' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#4F46E5' }}>History</Text>
        <Text style={{ fontSize: 20 }}>⚙️</Text>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: '#111827' }}>Rs 4,860</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          Spent in July · 24 transactions
        </Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
        {filters.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 18,
                borderRadius: 20,
                backgroundColor: isActive ? '#4F46E5' : '#E5E7EB',
                marginRight: 8,
              }}
            >
              <Text style={{ color: isActive ? '#FFFFFF' : '#374151', fontWeight: '600' }}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {transactionGroups.map((group) => (
          <View key={group.date} style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#6B7280',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              {group.date}
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {group.items.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderBottomWidth: index === group.items.length - 1 ? 0 : 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: item.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                      {item.category} · {item.time}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#DC2626' }}>
                    -Rs {item.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}