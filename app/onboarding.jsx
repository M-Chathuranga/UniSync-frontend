import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const ONBOARDED_KEY = '@smart_finance_onboarded';

const slides = [
  {
    id: '1',
    title: 'Voice-Driven Tracking',
    subtitle: 'Log your daily canteen lunch, bus fare, and campus expenses in seconds using quick voice prompts.',
    icon: 'mic',
    accentColor: '#4143d5',
    tag: 'FAST & HANDS-FREE',
  },
  {
    id: '2',
    title: 'Safe-To-Spend Daily',
    subtitle: 'Always know exactly how much cash you can spend today based on your remaining monthly balance and days.',
    icon: 'shield-checkmark',
    accentColor: '#10b981',
    tag: 'BUDGET CONTROL',
  },
  {
    id: '3',
    title: 'Visual Allocations',
    subtitle: 'Keep track of Boarding, Transport, Study, and Food budgets with clear visual charts and spending alerts.',
    icon: 'pie-chart',
    accentColor: '#6366f1',
    tag: 'SMART ANALYTICS',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
      router.replace('/login');
    } catch (error) {
      router.replace('/login');
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-xl bg-[#4143d5] items-center justify-center mr-2 shadow-sm">
            <Ionicons name="wallet" size={16} color="#ffffff" />
          </View>
          <Text className="text-base font-extrabold text-[#0f172a]">Smart Finance</Text>
        </View>

        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={completeOnboarding} className="px-3 py-1.5">
            <Text className="text-xs font-bold text-[#64748b]">Skip</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }} className="items-center px-8 justify-center flex-1">
            <View
              style={{ backgroundColor: `${item.accentColor}15` }}
              className="w-48 h-48 rounded-full items-center justify-center mb-8 border border-white shadow-lg shadow-indigo-100"
            >
              <View
                style={{ backgroundColor: item.accentColor }}
                className="w-24 h-24 rounded-full items-center justify-center shadow-md"
              >
                <Ionicons name={item.icon} size={48} color="#ffffff" />
              </View>
            </View>

            <View className="bg-[#ede9fe] px-3 py-1 rounded-full mb-3">
              <Text style={{ color: item.accentColor }} className="text-[11px] font-bold tracking-wider">
                {item.tag}
              </Text>
            </View>

            <Text className="text-2xl font-black text-[#0f172a] text-center mb-3">
              {item.title}
            </Text>

            <Text className="text-sm text-[#64748b] text-center leading-5 px-3">
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View className="px-8 pb-10">
        <View className="flex-row justify-center items-center mb-8 gap-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index ? 'w-7 bg-[#4143d5]' : 'w-2 bg-[#cbd5e1]'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          className="bg-[#4143d5] py-4 rounded-2xl items-center shadow-lg shadow-[#4143d5]/30 flex-row justify-center"
        >
          <Text className="text-white font-bold text-base mr-2">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
            size={18}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}