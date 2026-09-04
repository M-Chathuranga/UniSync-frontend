import React from 'react';
import { View, Text, FlatList } from 'react-native';

const categories = [
  { id: '1', name: 'Food & Drinks', type: 'Expense' },
  { id: '2', name: 'Transport', type: 'Expense' },
  { id: '3', name: 'Shopping', type: 'Expense' },
  { id: '4', name: 'Bills & Utilities', type: 'Expense' },
  
];

export default function CategoryManagement() {
  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Category Management</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-3 mb-2 bg-gray-100 rounded-lg flex-row justify-between items-center">
            <Text className="text-base font-semibold">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.type}</Text>
          </View>
        )}
      />
    </View>
  );
}