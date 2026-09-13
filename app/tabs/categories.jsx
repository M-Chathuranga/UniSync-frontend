import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DASHBOARD_STORAGE_KEY = '@smart_finance_dashboard_data_v3';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Food', spent: 0, budget: 15000, icon: 'restaurant', color: '#4143d5' },
    { id: '2', name: 'Boarding', spent: 0, budget: 10000, icon: 'home', color: '#10b981' },
    { id: '3', name: 'Transport', spent: 0, budget: 5000, icon: 'bus', color: '#ef4444' },
    { id: '4', name: 'Study', spent: 0, budget: 4000, icon: 'book', color: '#a855f7' },
    { id: '5', name: 'Other', spent: 0, budget: 3000, icon: 'receipt', color: '#64748b' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    loadCategoryExpenses();
  }, []);

  // Dashboard එකේ වියදම් අනුව Categories වල Spent අගයන් sync කරගැනීම
  const loadCategoryExpenses = async () => {
    try {
      const saved = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const activities = parsed.recentActivity || [];

        // Category එක අනුව මුළු වියදම ගණනය කිරීම
        const totals = { Food: 0, Boarding: 0, Transport: 0, Study: 0, Other: 0 };
        activities.forEach((item) => {
          if (item.amount < 0) {
            const cat = item.category || 'Other';
            totals[cat] = (totals[cat] || 0) + Math.abs(item.amount);
          }
        });

        setCategories((prev) =>
          prev.map((c) => ({
            ...c,
            spent: totals[c.name] || 0,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalBudget = categories.reduce((sum, item) => sum + item.budget, 0);
  const overallPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const handleAddCategory = () => {
    if (!newName.trim() || !newBudget.trim()) return;

    const newCategory = {
      id: Date.now().toString(),
      name: newName.trim(),
      spent: 0,
      budget: parseFloat(newBudget) || 0,
      icon: 'pricetag',
      color: '#4143d5',
    };

    setCategories([...categories, newCategory]);
    setNewName('');
    setNewBudget('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-[#0f172a]">Categories</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-9 h-9 rounded-full bg-[#ede9fe] items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#4143d5" />
          </TouchableOpacity>
        </View>

        {/* Total Budget Card */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#f1f5f9] mb-5">
          <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
            Monthly Category Budget
          </Text>
          <View className="flex-row justify-between items-baseline mb-3">
            <Text className="text-2xl font-extrabold text-[#0f172a]">
              Rs {totalSpent.toLocaleString()}
            </Text>
            <Text className="text-xs font-semibold text-[#64748b]">
              of Rs {totalBudget.toLocaleString()} limit
            </Text>
          </View>

          <View className="h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden mb-2">
            <View
              style={{ width: `${overallPercentage}%` }}
              className="h-full rounded-full bg-[#4143d5]"
            />
          </View>
          <Text className="text-[11px] font-medium text-[#64748b] text-right">
            {overallPercentage}% used
          </Text>
        </View>

        <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3 px-1">
          Active Allocations
        </Text>

        {categories.map((cat) => {
          const percent = cat.budget > 0 ? Math.min(Math.round((cat.spent / cat.budget) * 100), 100) : 0;
          const isOver = cat.spent > cat.budget;

          return (
            <View
              key={cat.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#f1f5f9] mb-3"
            >
              <View className="flex-row justify-between items-center mb-2.5">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{ backgroundColor: `${cat.color}15` }}
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  >
                    <Ionicons name={cat.icon} size={20} color={cat.color} />
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-[#0f172a]">{cat.name}</Text>
                    <Text className="text-[11px] text-[#64748b] mt-0.5">
                      Limit: Rs {cat.budget.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`text-xs font-bold ${isOver ? 'text-[#ef4444]' : 'text-[#0f172a]'}`}>
                    Rs {cat.spent.toLocaleString()}
                  </Text>
                  <Text className="text-[10px] font-semibold text-[#64748b] mt-0.5">
                    {percent}%
                  </Text>
                </View>
              </View>

              <View className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${percent}%`,
                    backgroundColor: isOver ? '#ef4444' : cat.color,
                  }}
                  className="h-full rounded-full"
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-[#0f172a] mb-4">Add Category</Text>

            <Text className="text-xs font-semibold text-[#64748b] mb-1">Category Name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Medical"
              placeholderTextColor="#94a3b8"
              className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-4"
            />

            <Text className="text-xs font-semibold text-[#64748b] mb-1">Monthly Budget (Rs)</Text>
            <TextInput
              value={newBudget}
              onChangeText={setNewBudget}
              keyboardType="numeric"
              placeholder="e.g. 3000"
              placeholderTextColor="#94a3b8"
              className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-6"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCategory}
                className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}