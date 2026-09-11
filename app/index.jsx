import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ONBOARDED_KEY = '@smart_finance_onboarded';
const AUTH_USER_KEY = '@smart_finance_auth_user';

export default function Index() {
  const [targetRoute, setTargetRoute] = useState(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
        if (!hasOnboarded) {
          setTargetRoute('/onboarding');
          return;
        }

        const userSession = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (userSession) {
          setTargetRoute('/tabs');
        } else {
          setTargetRoute('/login');
        }
      } catch (error) {
        setTargetRoute('/login');
      }
    };

    checkInitialRoute();
  }, []);

  if (targetRoute) {
    return <Redirect href={targetRoute} />;
  }

  return (
    <View className="flex-1 bg-[#f8fafc] items-center justify-center">
      <View className="w-16 h-16 rounded-3xl bg-[#4143d5] items-center justify-center shadow-lg shadow-[#4143d5]/40 mb-4">
        <Ionicons name="wallet" size={32} color="#ffffff" />
      </View>
      <Text className="text-xl font-black text-[#0f172a] mb-6">Smart Finance</Text>
      <ActivityIndicator size="small" color="#4143d5" />
    </View>
  );
}