import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { api } from '../../services/api';

// Static category budget limits (per month) — can be made editable in future
const INITIAL_CATEGORY_CONFIG = [
  { name: 'Food',      icon: 'restaurant', color: '#4143d5', budget: 15000 },
  { name: 'Boarding',  icon: 'home',       color: '#10b981', budget: 10000 },
  { name: 'Transport', icon: 'bus',        color: '#ef4444', budget: 5000  },
  { name: 'Study',     icon: 'book',       color: '#a855f7', budget: 4000  },
  { name: 'Other',     icon: 'receipt',    color: '#64748b', budget: 3000  },
  { name: 'Medical',   icon: 'pricetag',   color: '#ec4899', budget: 2500  },
];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]); // Combined list with actual spend
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');

  // Refresh category data every time this tab receives focus
  useFocusEffect(
    useCallback(() => {
      loadCategoryData();
    }, [])
  );

  // Fetch category spend summary from backend and merge with local budget config
  const loadCategoryData = async () => {
    try {
      // GET /expenses/summary/category — returns [ { category, totalAmount } ]
      const summaryRes = await api.getCategorySummary();
      const spendMap = {};
      summaryRes.data.forEach((entry) => {
        spendMap[entry.category] = entry.totalAmount; // Map category name → total spent
      });

      // Merge the server spend totals into the local category config list
      const merged = INITIAL_CATEGORY_CONFIG.map((cat) => ({
        id: cat.name,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budget: cat.budget,
        spent: spendMap[cat.name] || 0, // Fall back to 0 if no expenses yet
      }));

      // Also fetch any user-created categories from GET /categories
      const customCats = await api.getCategories();
      const customMapped = customCats
        .filter((c) => !INITIAL_CATEGORY_CONFIG.some((init) => init.name === c.name)) // Skip duplicates
        .map((c) => ({
          id: c._id,
          name: c.name,
          icon: c.icon || 'pricetag',
          color: '#4143d5',
          budget: 0,
          spent: spendMap[c.name] || 0,
        }));

      setCategories([...merged, ...customMapped]);
    } catch (e) {
      console.error('Error loading category data:', e);
    }
  };

  // Compute totals for the summary card
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalBudget = categories.reduce((sum, item) => sum + item.budget, 0);
  const overallPercentage =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Add a new custom category to the backend and reload
  const handleAddCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    try {
      // POST /categories — saves to DB under req.user.id
      await api.addCategory({ name: newName.trim(), icon: 'pricetag' });
      setNewName('');
      setNewBudget('');
      setModalVisible(false);
      loadCategoryData(); // Refresh list from backend
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add category');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-[#0f172a]">Categories</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-9 h-9 rounded-full bg-[#ede9fe] items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#4143d5" />
          </TouchableOpacity>
        </View>

        {/* Total Budget Summary Card */}
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

        {/* Category Cards — real spend from backend, budget from config */}
        {categories.map((cat) => {
          const percent =
            cat.budget > 0 ? Math.min(Math.round((cat.spent / cat.budget) * 100), 100) : 0;
          const isOver = cat.budget > 0 && cat.spent > cat.budget;

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
                      {cat.budget > 0 ? `Limit: Rs ${cat.budget.toLocaleString()}` : 'No budget set'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  {/* Highlight over-budget amount in red */}
                  <Text className={`text-xs font-bold ${isOver ? 'text-[#ef4444]' : 'text-[#0f172a]'}`}>
                    Rs {cat.spent.toLocaleString()}
                  </Text>
                  <Text className="text-[10px] font-semibold text-[#64748b] mt-0.5">{percent}%</Text>
                </View>
              </View>

              {/* Progress bar */}
              {cat.budget > 0 && (
                <View className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isOver ? '#ef4444' : cat.color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
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

            <Text className="text-xs font-semibold text-[#64748b] mb-1">
              Monthly Budget (Rs) — Optional
            </Text>
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