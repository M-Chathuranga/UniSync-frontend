import React, { useState, useCallback, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

const CUSTOM_BUDGETS_KEY = '@smart_finance_custom_category_budgets';

// Static category budget limits (per month)
const INITIAL_CATEGORY_CONFIG = [
  { name: 'Food',      icon: 'restaurant', color: '#4143d5', budget: 15000 },
  { name: 'Boarding',  icon: 'home',       color: '#10b981', budget: 10000 },
  { name: 'Transport', icon: 'bus',        color: '#ef4444', budget: 5000  },
  { name: 'Study',     icon: 'book',       color: '#a855f7', budget: 4000  },
  { name: 'Other',     icon: 'receipt',    color: '#64748b', budget: 3000  },
];

// Pick matching icon & color for custom categories (e.g. Medical -> medkit)
const getCustomCategoryStyle = (name = '') => {
  const lower = name.trim().toLowerCase();
  if (lower.includes('medical') || lower.includes('health') || lower.includes('doctor') || lower.includes('pharmacy')) {
    return { icon: 'medkit', color: '#ec4899' };
  }
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('sport')) {
    return { icon: 'barbell', color: '#f97316' };
  }
  if (lower.includes('entertainment') || lower.includes('movie') || lower.includes('game')) {
    return { icon: 'game-controller', color: '#8b5cf6' };
  }
  if (lower.includes('shop') || lower.includes('cloth')) {
    return { icon: 'bag-handle', color: '#0ea5e9' };
  }
  return { icon: 'pricetag', color: '#4143d5' };
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CategoriesScreen() {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = now.getFullYear();

  const [allExpenses, setAllExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [savedBudgetsMap, setSavedBudgetsMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');

  // Edit / Delete modal state for custom categories
  const [editCatModal, setEditCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [editBudgetInput, setEditBudgetInput] = useState('');

  // Period filter state: 'current' | 'year' | 'YYYY-MM'
  const [periodMode, setPeriodMode] = useState('current');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCategoryData();
    }, [])
  );

  // Fetch all expenses, custom categories, and local budget overrides
  const loadCategoryData = async () => {
    try {
      const [expensesRes, customCatsRes, localBudgetsRaw] = await Promise.all([
        api.getExpenses(),
        api.getCategories(),
        AsyncStorage.getItem(CUSTOM_BUDGETS_KEY),
      ]);

      setAllExpenses(Array.isArray(expensesRes) ? expensesRes : []);
      setCustomCategories(Array.isArray(customCatsRes) ? customCatsRes : []);
      setSavedBudgetsMap(localBudgetsRaw ? JSON.parse(localBudgetsRaw) : {});
    } catch (e) {
      console.error('Error loading category data:', e);
    }
  };

  // Build selectable list of months
  const availableMonths = useMemo(() => {
    const map = new Map();

    for (let m = now.getMonth(); m >= 0; m--) {
      const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      map.set(key, `${MONTH_NAMES[m]} ${currentYear}`);
    }

    allExpenses.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`);
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [allExpenses, currentYear]);

  // Compute period title and category spend totals for active period
  const { categories, periodTitle, budgetMultiplier } = useMemo(() => {
    const filteredExpenses = allExpenses.filter((tx) => {
      const d = new Date(tx.date);
      if (periodMode === 'year') {
        return d.getFullYear() === currentYear;
      }
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const targetKey = periodMode === 'current' ? currentMonthKey : periodMode;
      return key === targetKey;
    });

    const spendMap = {};
    filteredExpenses.forEach((tx) => {
      const cat = tx.category || 'Other';
      spendMap[cat] = (spendMap[cat] || 0) + (Number(tx.amount) || 0);
    });

    const multiplier = periodMode === 'year' ? 12 : 1;

    const merged = INITIAL_CATEGORY_CONFIG.map((cat) => ({
      id: cat.name,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isCustom: false,
      budget: cat.budget * multiplier,
      spent: spendMap[cat.name] || 0,
    }));

    const customMapped = customCategories
      .filter((c) => !INITIAL_CATEGORY_CONFIG.some((init) => init.name === c.name))
      .map((c) => {
        const monthlyLimit = Number(c.budget) || Number(savedBudgetsMap[c.name]) || 0;
        const style = getCustomCategoryStyle(c.name);
        return {
          id: c._id,
          name: c.name,
          icon: c.icon && c.icon !== 'pricetag' ? c.icon : style.icon,
          color: style.color,
          isCustom: true,
          rawMonthlyBudget: monthlyLimit,
          budget: monthlyLimit * multiplier,
          spent: spendMap[c.name] || 0,
        };
      });

    let title = `${MONTH_NAMES[now.getMonth()]} ${currentYear}`;
    if (periodMode === 'year') {
      title = `Year ${currentYear}`;
    } else if (periodMode !== 'current') {
      const found = availableMonths.find((m) => m.key === periodMode);
      if (found) title = found.label;
    }

    return {
      categories: [...merged, ...customMapped],
      periodTitle: title,
      budgetMultiplier: multiplier,
    };
  }, [allExpenses, customCategories, savedBudgetsMap, periodMode, availableMonths, currentMonthKey, currentYear]);

  // Compute totals for the summary card
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalBudget = categories.reduce((sum, item) => sum + item.budget, 0);
  const overallPercentage =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Add a new custom category with its monthly budget and matching icon
  const handleAddCategory = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    const parsedBudget = parseFloat(newBudget);
    const validBudget = !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : 0;
    const style = getCustomCategoryStyle(trimmedName);

    try {
      await api.addCategory({
        name: trimmedName,
        icon: style.icon,
        budget: validBudget,
      });

      if (validBudget > 0) {
        const updatedMap = { ...savedBudgetsMap, [trimmedName]: validBudget };
        setSavedBudgetsMap(updatedMap);
        await AsyncStorage.setItem(CUSTOM_BUDGETS_KEY, JSON.stringify(updatedMap));
      }

      setNewName('');
      setNewBudget('');
      setModalVisible(false);
      loadCategoryData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add category');
    }
  };

  // Open Edit/Delete modal for a custom category
  const openEditModal = (cat) => {
    setSelectedCat(cat);
    setEditNameInput(cat.name);
    setEditBudgetInput(cat.rawMonthlyBudget > 0 ? String(cat.rawMonthlyBudget) : '');
    setEditCatModal(true);
  };

  // Save updated name and monthly budget for an existing custom category
  const handleUpdateCategory = async () => {
    if (!selectedCat) return;
    const trimmedName = editNameInput.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    const parsed = parseFloat(editBudgetInput);
    const validBudget = !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    const style = getCustomCategoryStyle(trimmedName);

    try {
      // Update on backend if PUT /categories/:id exists
      if (api.updateCategory) {
        await api.updateCategory(selectedCat.id, {
          name: trimmedName,
          icon: style.icon,
          budget: validBudget,
        });
      }
    } catch (e) {
      console.warn('Backend updateCategory fallback to local state:', e.message);
    }

    try {
      // Update local budget map (and rename key if category name changed)
      const updatedMap = { ...savedBudgetsMap };
      if (selectedCat.name !== trimmedName) {
        delete updatedMap[selectedCat.name];
      }
      updatedMap[trimmedName] = validBudget;
      setSavedBudgetsMap(updatedMap);
      await AsyncStorage.setItem(CUSTOM_BUDGETS_KEY, JSON.stringify(updatedMap));

      // Update local customCategories list immediately
      setCustomCategories((prev) =>
        prev.map((c) =>
          c._id === selectedCat.id
            ? { ...c, name: trimmedName, icon: style.icon, budget: validBudget }
            : c
        )
      );

      setEditCatModal(false);
      setSelectedCat(null);
      loadCategoryData();
    } catch (e) {
      Alert.alert('Error', 'Failed to update category.');
    }
  };

  // Delete an existing custom category
  const handleDeleteCategory = () => {
    if (!selectedCat) return;

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${selectedCat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (api.deleteCategory) {
                await api.deleteCategory(selectedCat.id);
              }
            } catch (e) {
              console.warn('Backend deleteCategory fallback to local state:', e.message);
            }

            try {
              const updatedMap = { ...savedBudgetsMap };
              delete updatedMap[selectedCat.name];
              setSavedBudgetsMap(updatedMap);
              await AsyncStorage.setItem(CUSTOM_BUDGETS_KEY, JSON.stringify(updatedMap));

              setCustomCategories((prev) => prev.filter((c) => c._id !== selectedCat.id));
              setEditCatModal(false);
              setSelectedCat(null);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-[#0f172a]">Categories · {periodTitle}</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-9 h-9 rounded-full bg-[#ede9fe] items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#4143d5" />
          </TouchableOpacity>
        </View>

        {/* Period Switcher Bar */}
        <View className="flex-row items-center gap-2 mb-3">
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

        {/* Expandable Past Month Selector */}
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

        {/* Total Budget Summary Card */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#f1f5f9] mb-5">
          <Text className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
            {budgetMultiplier === 12
              ? `Annual Category Budget (${currentYear})`
              : `Category Budget · ${periodTitle}`}
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
          Active Allocations ({periodTitle})
        </Text>

        {/* Category Cards */}
        {categories.map((cat) => {
          const percent =
            cat.budget > 0 ? Math.min(Math.round((cat.spent / cat.budget) * 100), 100) : 0;
          const isOver = cat.budget > 0 && cat.spent > cat.budget;

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={cat.isCustom ? 0.7 : 1}
              onPress={() => {
                if (cat.isCustom) {
                  openEditModal(cat);
                }
              }}
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
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-bold text-[#0f172a]">{cat.name}</Text>
                      {cat.isCustom && (
                        <Ionicons
                          name="create-outline"
                          size={13}
                          color="#94a3b8"
                          style={{ marginLeft: 5 }}
                        />
                      )}
                    </View>
                    <Text className="text-[11px] text-[#64748b] mt-0.5">
                      {cat.budget > 0
                        ? `Limit: Rs ${cat.budget.toLocaleString()}`
                        : 'No budget set (Tap to edit)'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
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
            </TouchableOpacity>
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
              Monthly Budget (Rs)
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

      {/* Edit / Delete Custom Category Modal */}
      <Modal
        visible={editCatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditCatModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-4" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#0f172a]">Edit Category</Text>
              <TouchableOpacity
                onPress={handleDeleteCategory}
                className="flex-row items-center bg-[#fee2e2] px-3 py-1.5 rounded-xl"
              >
                <Ionicons name="trash-outline" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                <Text className="text-xs font-bold text-[#dc2626]">Delete</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold text-[#64748b] mb-1">Category Name</Text>
            <TextInput
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="e.g. Medical"
              placeholderTextColor="#94a3b8"
              className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-4"
            />

            <Text className="text-xs font-semibold text-[#64748b] mb-1">Monthly Budget (Rs)</Text>
            <TextInput
              value={editBudgetInput}
              onChangeText={setEditBudgetInput}
              keyboardType="numeric"
              placeholder="e.g. 3000"
              placeholderTextColor="#94a3b8"
              className="bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f172a] mb-6"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditCatModal(false)}
                className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateCategory}
                className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}