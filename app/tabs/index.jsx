<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import SafeToSpendCard from '../../components/SafeToSpendCard';
import VoiceListeningOverlay from '../../components/VoiceListeningOverlay';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import CategoryCard from '../../components/CategoryCard';
import TransactionCard from '../../components/TransactionCard';

// TODO: replace with real data from the backend
const MOCK = {
  userName: 'Kavishka',
  date: 'Fri, 04 Sep',
  safeToSpend: 640,
  daysLeft: 17,
  month: 'Jul',
  income: 25000,
  expenses: 16500,
  balance: 8500,
  breakdown: [
    { label: 'Food', percent: 28, color: '#4143d5' },
    { label: 'Boarding', percent: 27, color: '#6dfe9c' },
    { label: 'Transport', percent: 21, color: '#c2494b' },
    { label: 'Study', percent: 12, color: '#a13135' },
    { label: 'Other', percent: 12, color: '#767586' },
  ],
  recentActivity: [
    { id: '1', title: 'Canteen lunch', sub: 'Food · 12:40 PM', amount: -200, icon: 'restaurant' },
    { id: '2', title: 'Bus fare', sub: 'Transport · 8:10 PM', amount: -60, icon: 'bus' },
  ],
};

export default function DashboardScreen() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (e) => setHeardText(e.value?.[0] || '');
    Voice.onSpeechError = () => setIsListening(false);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    setShowOverlay(true);
    setHeardText('');
    await Voice.start('en-US');
    setIsListening(true);
  };

  const stopListening = async () => {
    await Voice.stop();
    setIsListening(false);
  };
=======

import React from 'react';
import { View, Text } from 'react-native';
>>>>>>> 9e0e87e (Fix tabs layout and organize directorystructure)

  return (
    <SafeAreaView className="flex-1 bg-[#f7f9fb]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Header appName="Smart Finance" userInitial={MOCK.userName.charAt(0)} />

        <Text className="text-2xl font-bold text-[#191c1e] mb-1">Hello, {MOCK.userName} 👋</Text>
        <Text className="text-sm text-[#464555] mb-5">{MOCK.date}</Text>

        <SafeToSpendCard amount={MOCK.safeToSpend} daysLeft={MOCK.daysLeft} month={MOCK.month} />

        {/* Stats row */}
        <View className="flex-row justify-between mt-4 mb-5">
          <Card className="flex-1 mx-1 items-center">
            <Badge icon="arrow-down" bgColor="#6dfe9c" iconColor="#005227" />
            <Text className="text-[10px] text-[#464555] mt-1">Income</Text>
            <Text className="text-xs font-bold text-[#191c1e] mt-0.5">{MOCK.income.toLocaleString()}</Text>
          </Card>
          <Card className="flex-1 mx-1 items-center">
            <Badge icon="arrow-up" bgColor="#ffdad6" iconColor="#93000a" />
            <Text className="text-[10px] text-[#464555] mt-1">Expenses</Text>
            <Text className="text-xs font-bold text-[#191c1e] mt-0.5">{MOCK.expenses.toLocaleString()}</Text>
          </Card>
          <Card className="flex-1 mx-1 items-center">
            <Badge icon="wallet" bgColor="#e1e0ff" iconColor="#2c2cc3" />
            <Text className="text-[10px] text-[#464555] mt-1">Balance</Text>
            <Text className="text-xs font-bold text-[#191c1e] mt-0.5">{MOCK.balance.toLocaleString()}</Text>
          </Card>
        </View>

        {/* Spending breakdown */}
        <Card className="mb-5">
          <Text className="text-base font-bold text-[#191c1e] mb-4">Spending Breakdown</Text>
          {MOCK.breakdown.map((item) => (
            <CategoryCard key={item.label} label={item.label} percent={item.percent} color={item.color} />
          ))}
        </Card>

        {/* Recent activity */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-[#191c1e]">Recent Activity</Text>
          <Text className="text-xs font-semibold text-[#4143d5]">See All</Text>
        </View>
        {MOCK.recentActivity.map((item) => (
          <TransactionCard key={item.id} title={item.title} sub={item.sub} amount={item.amount} icon={item.icon} />
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={startListening}
        className="absolute bottom-8 self-center w-14 h-14 rounded-full bg-[#4143d5] items-center justify-center"
        style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="mic" size={26} color="#fff" />
      </TouchableOpacity>

      <VoiceListeningOverlay
        visible={showOverlay}
        isListening={isListening}
        heardText={heardText}
        onStop={stopListening}
        onClose={() => setShowOverlay(false)}
      />
    </SafeAreaView>
  );
}
