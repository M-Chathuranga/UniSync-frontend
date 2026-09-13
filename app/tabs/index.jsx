import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const DASHBOARD_STORAGE_KEY = '@smart_finance_dashboard_data_v3';
const AUTH_USER_KEY = '@smart_finance_auth_user';

const getLiveDateInfo = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  const monthStr = now.toLocaleDateString('en-US', { month: 'short' });
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, totalDaysInMonth - now.getDate());
  return { dateStr, monthStr, daysLeft };
};

const initialFinanceState = {
  income: 0,
  expenses: 0,
  balance: 0,
  chartData: [],
  breakdown: [
    { label: 'Food', percent: 0, color: '#4143d5' },
    { label: 'Boarding', percent: 0, color: '#10b981' },
    { label: 'Transport', percent: 0, color: '#ef4444' },
    { label: 'Study', percent: 0, color: '#a855f7' },
    { label: 'Other', percent: 0, color: '#64748b' },
  ],
  recentActivity: [],
};

const CATEGORY_COLORS = {
  Food: '#4143d5',
  Boarding: '#10b981',
  Transport: '#ef4444',
  Study: '#a855f7',
  Other: '#64748b',
};

export default function DashboardScreen() {
  const router = useRouter();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const [dateInfo, setDateInfo] = useState(getLiveDateInfo());
  const [userProfile, setUserProfile] = useState({ name: 'User', email: '' });
  const [financeData, setFinanceData] = useState(initialFinanceState);

  useEffect(() => {
    setDateInfo(getLiveDateInfo());
    loadUserSession();
    loadFinanceData();
  }, []);

  const loadUserSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadFinanceData = async () => {
    try {
      const saved = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        setFinanceData(JSON.parse(saved));
      } else {
        setFinanceData(initialFinanceState);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveFinanceData = async (newData) => {
    try {
      setFinanceData(newData);
      await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to clear all transactions, expenses, and the Pie Chart to Rs 0?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Rs 0',
          style: 'destructive',
          onPress: async () => {
            await saveFinanceData(initialFinanceState);
          },
        },
      ]
    );
  };

  const safeToSpend = Math.max(0, Math.round(financeData.balance / dateInfo.daysLeft));

  const handleAddNewTransaction = (newTx) => {
    let updatedExpenses = financeData.expenses;
    let updatedIncome = financeData.income;
    let updatedBalance = financeData.balance;

    if (newTx.type === 'income') {
      updatedIncome += newTx.amount;
      updatedBalance += newTx.amount;
    } else {
      updatedExpenses += newTx.amount;
      updatedBalance -= newTx.amount;
    }

    const updatedActivity = [
      {
        id: Date.now().toString(),
        title: newTx.title,
        sub: `${newTx.category} · Just now`,
        amount: newTx.type === 'income' ? newTx.amount : -newTx.amount,
        category: newTx.category,
        icon: newTx.icon,
      },
      ...financeData.recentActivity,
    ];

    const expenseActivities = updatedActivity.filter((tx) => tx.amount < 0);
    const totalExp = expenseActivities.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    let updatedBreakdown = initialFinanceState.breakdown;
    let updatedChartData = [];

    if (totalExp > 0) {
      const catTotals = { Food: 0, Boarding: 0, Transport: 0, Study: 0, Other: 0 };
      expenseActivities.forEach((tx) => {
        const cat = tx.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + Math.abs(tx.amount);
      });

      updatedBreakdown = Object.keys(catTotals).map((cat) => ({
        label: cat,
        percent: Math.round((catTotals[cat] / totalExp) * 100),
        color: CATEGORY_COLORS[cat] || '#64748b',
      }));

      updatedChartData = Object.keys(catTotals)
        .filter((cat) => catTotals[cat] > 0)
        .map((cat) => ({
          name: cat,
          population: catTotals[cat],
          color: CATEGORY_COLORS[cat] || '#64748b',
          legendFontColor: '#475569',
          legendFontSize: 12,
        }));
    }

    const updatedData = {
      income: updatedIncome,
      expenses: updatedExpenses,
      balance: updatedBalance,
      chartData: updatedChartData,
      breakdown: updatedBreakdown,
      recentActivity: updatedActivity,
    };

    saveFinanceData(updatedData);
  };

  const chartConfig = {
    color: (opacity = 1) => `rgba(65, 67, 213, ${opacity})`,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-[#0f172a]">Smart Finance</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleResetAllData}
              activeOpacity={0.8}
              className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-200"
            >
              <Ionicons name="refresh" size={16} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowManualModal(true)}
              activeOpacity={0.8}
              className="w-8 h-8 rounded-full bg-[#4143d5] items-center justify-center shadow-sm"
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/tabs/settings')}
              activeOpacity={0.8}
              className="w-8 h-8 rounded-full bg-[#ede9fe] items-center justify-center border border-[#c7d2fe]"
            >
              <Text className="text-[#4143d5] font-bold text-xs">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-2xl font-bold text-[#0f172a]">
          Hello, {userProfile.name} 👋
        </Text>
        <Text className="text-xs text-[#64748b] mt-0.5 mb-4">{dateInfo.dateStr}</Text>

        <View className="bg-[#f0fdf4] rounded-3xl p-5 flex-row justify-between items-center border border-[#dcfce7] mb-4">
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#16a34a] tracking-wider">
              SAFE TO SPEND TODAY
            </Text>
            <Text className="text-3xl font-extrabold text-[#15803d] my-1">
              Rs {safeToSpend}.00
            </Text>
            <Text className="text-xs font-medium text-[#16a34a]">
              • {dateInfo.daysLeft} days left in {dateInfo.monthStr}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#94a3b8] items-center justify-center">
            <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
          </View>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#dcfce7] items-center justify-center mb-1">
              <Ionicons name="arrow-down" size={14} color="#16a34a" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Income</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.income.toLocaleString()}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#fee2e2] items-center justify-center mb-1">
              <Ionicons name="arrow-up" size={14} color="#ef4444" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Expenses</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.expenses.toLocaleString()}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 items-center mx-1 shadow-sm border border-[#f1f5f9]">
            <View className="w-8 h-8 rounded-full bg-[#e0e7ff] items-center justify-center mb-1">
              <Ionicons name="wallet" size={14} color="#4338ca" />
            </View>
            <Text className="text-[11px] text-[#64748b]">Balance</Text>
            <Text className="text-xs font-bold text-[#0f172a] mt-0.5">
              {financeData.balance.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-[#f1f5f9]">
          <Text className="text-sm font-bold text-[#0f172a] mb-2">Spending Breakdown</Text>
          
          {financeData.expenses === 0 || !financeData.chartData || financeData.chartData.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Ionicons name="pie-chart-outline" size={44} color="#cbd5e1" />
              <Text className="text-xs font-bold text-[#94a3b8] mt-2">No expenses recorded yet</Text>
              <Text className="text-[11px] text-[#cbd5e1] mt-0.5">Breakdown chart is reset to Rs 0</Text>
            </View>
          ) : (
            <>
              <View className="items-center">
                <PieChart
                  data={financeData.chartData}
                  width={screenWidth - 56}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="10"
                  absolute
                />
              </View>

              <View className="mt-2">
                {financeData.breakdown.map((item) => (
                  <View key={item.label} className="mb-2.5">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs font-medium text-[#334155]">{item.label}</Text>
                      <Text className="text-xs font-semibold text-[#0f172a]">{item.percent}%</Text>
                    </View>
                    <View className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <View
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                        className="h-full rounded-full"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-bold text-[#0f172a]">Recent Activity</Text>
            {financeData.recentActivity.length > 0 && (
              <TouchableOpacity>
                <Text className="text-xs font-semibold text-[#4143d5]">See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {financeData.recentActivity.length === 0 ? (
            <View className="py-6 items-center justify-center">
              <Ionicons name="receipt-outline" size={32} color="#cbd5e1" />
              <Text className="text-xs text-[#94a3b8] mt-1.5">No recent transactions</Text>
            </View>
          ) : (
            financeData.recentActivity.map((item) => (
              <View key={item.id} className="flex-row justify-between items-center py-2.5 border-b border-[#f8fafc] last:border-b-0">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-2xl bg-[#f1f5f9] items-center justify-center mr-3">
                    <Ionicons name={item.icon || 'receipt'} size={18} color="#4143d5" />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-[#0f172a]">{item.title}</Text>
                    <Text className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</Text>
                  </View>
                </View>
                <Text className={`text-xs font-bold ${item.amount < 0 ? 'text-[#ef4444]' : 'text-[#16a34a]'}`}>
                  {item.amount < 0 ? `- Rs ${Math.abs(item.amount)}` : `+ Rs ${item.amount}`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-6 self-center items-center justify-center">
        <View className="w-16 h-16 rounded-full bg-[#4143d5]/20 items-center justify-center">
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setShowVoiceModal(true)}
            className="rounded-full bg-[#4143d5] items-center justify-center border-2 border-white shadow-xl shadow-[#4143d5]/60"
            style={{ elevation: 12, width: 54, height: 54 }}
          >
            <Ionicons name="mic" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <InternalVoiceModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onAddExpense={(exp) => handleAddNewTransaction({ ...exp, type: 'expense' })}
      />

      <ManualAddModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onAddTransaction={handleAddNewTransaction}
      />
    </SafeAreaView>
  );
}

function ManualAddModal({ visible, onClose, onAddTransaction }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');

  const categories = [
    { name: 'Food', icon: 'restaurant' },
    { name: 'Transport', icon: 'bus' },
    { name: 'Boarding', icon: 'home' },
    { name: 'Study', icon: 'book' },
    { name: 'Other', icon: 'receipt' },
  ];

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid title and amount.');
      return;
    }

    const catObj = categories.find((c) => c.name === selectedCategory) || { icon: 'receipt' };

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      icon: type === 'income' ? 'wallet' : catObj.icon,
      type: type,
    });

    setTitle('');
    setAmount('');
    setType('expense');
    setSelectedCategory('Food');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-white rounded-t-[32px] px-6 pt-5 pb-9">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

          <Text className="text-lg font-bold text-[#0f172a] mb-4">Add Transaction</Text>

          <View className="flex-row bg-[#f1f5f9] p-1 rounded-2xl mb-4">
            <TouchableOpacity
              onPress={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                type === 'expense' ? 'bg-[#ef4444]' : 'bg-transparent'
              }`}
            >
              <Text className={`text-xs font-bold ${type === 'expense' ? 'text-white' : 'text-[#64748b]'}`}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                type === 'income' ? 'bg-[#16a34a]' : 'bg-transparent'
              }`}
            >
              <Text className={`text-xs font-bold ${type === 'income' ? 'text-white' : 'text-[#64748b]'}`}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xs font-semibold text-[#64748b] mb-1">Title / Description</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={type === 'expense' ? 'e.g. Canteen lunch' : 'e.g. Monthly Allowance'}
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

          {type === 'expense' && (
            <>
              <Text className="text-xs font-semibold text-[#64748b] mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {categories.map((c) => {
                  const isSelected = selectedCategory === c.name;
                  return (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => setSelectedCategory(c.name)}
                      className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                        isSelected
                          ? 'bg-[#4143d5] border-[#4143d5]'
                          : 'bg-[#f8fafc] border-gray-200'
                      }`}
                    >
                      <Ionicons
                        name={c.icon}
                        size={14}
                        color={isSelected ? '#ffffff' : '#64748b'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-[#64748b]'
                        }`}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
            >
              <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-[#4143d5] py-3.5 rounded-xl items-center shadow-md shadow-[#4143d5]/30"
            >
              <Text className="text-xs font-bold text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InternalVoiceModal({ visible, onClose, onAddExpense }) {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [detectedExpense, setDetectedExpense] = useState(null);

  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim1, {
              toValue: 1.45,
              duration: 800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim1, {
              toValue: 1,
              duration: 800,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.7,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 1000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (visible) {
      setIsRecording(false);
      setSpokenText('');
      setDetectedExpense(null);
    }
  }, [visible]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Smart Finance needs access to your microphone to record voice expenses.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is required.');
        return;
      }

      setIsRecording(true);
      setSpokenText('Listening to audio...');
      setDetectedExpense(null);

      setTimeout(() => {
        setIsRecording(false);
        parseExpense('Rs 250 for canteen lunch');
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const parseExpense = (text) => {
    setSpokenText(text);
    const clean = text.toLowerCase();
    const match = clean.match(/(?:rs\.?|rupees)?\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = match ? parseFloat(match[1]) : 0;

    let category = 'Other';
    let icon = 'receipt';
    if (/(lunch|canteen|food|tea|dinner|breakfast|snack|rice|coffee|kottu)/i.test(clean)) {
      category = 'Food';
      icon = 'restaurant';
    } else if (/(bus|transit|train|ticket|uber|pickme|fuel|petrol)/i.test(clean)) {
      category = 'Transport';
      icon = 'bus';
    } else if (/(boarding|rent|room|hostel)/i.test(clean)) {
      category = 'Boarding';
      icon = 'home';
    } else if (/(book|study|photocopy|pen|print|exam|class)/i.test(clean)) {
      category = 'Study';
      icon = 'book';
    }

    if (amount > 0) {
      setDetectedExpense({
        title: text.trim(),
        amount: amount,
        category: category,
        icon: icon,
      });
    }
  };

  const handleSave = () => {
    if (detectedExpense) {
      onAddExpense(detectedExpense);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[36px] px-6 pt-6 pb-10 items-center shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-5" />

          <Text className="text-xl font-extrabold text-[#0f172a]">Voice Assistant</Text>
          <Text className="text-xs text-[#64748b] mt-1 mb-6 text-center">
            {isRecording ? 'Listening... Tap mic to stop' : 'Tap microphone or choose a prompt'}
          </Text>

          <View className="items-center justify-center my-4 h-36 w-36">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim2 }],
                opacity: pulseAnim2.interpolate({ inputRange: [1, 1.7], outputRange: [0.35, 0] }),
              }}
              className="absolute w-32 h-32 rounded-full bg-[#4143d5]"
            />
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim1 }],
                opacity: pulseAnim1.interpolate({ inputRange: [1, 1.45], outputRange: [0.5, 0.05] }),
              }}
              className="absolute w-24 h-24 rounded-full bg-[#818cf8]"
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={toggleRecording}
              className={`w-20 h-20 rounded-full items-center justify-center shadow-xl border-4 border-[#e0e7ff] ${
                isRecording ? 'bg-[#ef4444]' : 'bg-[#4143d5]'
              }`}
              style={{ elevation: 10 }}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={34} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl p-3.5 my-3">
            <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Spoken Query:
            </Text>
            <Text className="text-sm font-semibold text-[#0f172a] italic">
              {spokenText ? `"${spokenText}"` : 'Tap mic or choose a prompt below'}
            </Text>
          </View>

          {detectedExpense && (
            <View className="w-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 my-2 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#d1fae5] items-center justify-center mr-3">
                  <Ionicons name={detectedExpense.icon} size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#065f46]">{detectedExpense.category}</Text>
                  <Text className="text-[11px] text-gray-500">{detectedExpense.title}</Text>
                </View>
              </View>
              <Text className="text-base font-extrabold text-[#047857]">
                - Rs {detectedExpense.amount}
              </Text>
            </View>
          )}

          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-2 self-start">
            Quick Prompts:
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4 w-full">
            {['Rs 250 for lunch', 'Bus fare 60', 'Rs 350 for books'].map((sample) => (
              <TouchableOpacity
                key={sample}
                onPress={() => parseExpense(sample)}
                className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs"
              >
                <Text className="text-xs text-[#4143d5] font-medium">{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3 w-full mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#475569]">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!detectedExpense}
              className={`flex-1 py-3.5 rounded-2xl items-center justify-center shadow-md ${
                detectedExpense ? 'bg-[#4143d5]' : 'bg-gray-300'
              }`}
            >
              <Text className="text-xs font-bold text-white">Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}