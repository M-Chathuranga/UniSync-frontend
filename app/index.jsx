import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

const ONBOARDED_KEY = '@smart_finance_onboarded';
const AUTH_USER_KEY = '@smart_finance_auth_user';
const BIOMETRIC_ENABLED_KEY = '@smart_finance_biometric_enabled';

export default function Index() {
  const router = useRouter();
  const [targetRoute, setTargetRoute] = useState(null);
  const [needsBiometric, setNeedsBiometric] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
      if (!hasOnboarded) {
        setTargetRoute('/onboarding');
        return;
      }

      const userSession = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (!userSession) {
        setTargetRoute('/login');
        return;
      }

      // Check if biometric unlock is enabled (defaults to true)
      const bioSetting = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const isBioEnabled = bioSetting !== 'false';

      // Verify device hardware and enrolled fingerprint/face data
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (isBioEnabled && hasHardware && isEnrolled) {
        setNeedsBiometric(true);
        promptBiometricAuth();
      } else {
        setTargetRoute('/tabs');
      }
    } catch (error) {
      setTargetRoute('/login');
    }
  };

  // Trigger native Android/iOS Fingerprint or Face ID prompt
  const promptBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Smart Finance',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setTargetRoute('/tabs');
      }
    } catch (e) {
      Alert.alert('Authentication Error', 'Please try again or log in with your password.');
    }
  };

  if (targetRoute) {
    return <Redirect href={targetRoute} />;
  }

  // Biometric Lock Screen shown when user has an active session
  if (needsBiometric) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <View className="w-20 h-20 rounded-3xl bg-[#4143d5] items-center justify-center shadow-lg shadow-[#4143d5]/40 mb-5">
          <Ionicons name="wallet" size={38} color="#ffffff" />
        </View>
        <Text className="text-2xl font-black text-[#0f172a] mb-1">Smart Finance</Text>
        <Text className="text-xs text-[#64748b] text-center mb-10">
          Verify your fingerprint to access your account
        </Text>

        {/* Tap Fingerprint Icon Button */}
        <TouchableOpacity
          onPress={promptBiometricAuth}
          className="w-20 h-20 rounded-full bg-[#ede9fe] border-2 border-[#4143d5] items-center justify-center mb-3"
        >
          <Ionicons name="finger-print" size={42} color="#4143d5" />
        </TouchableOpacity>
        <Text className="text-xs font-semibold text-[#4143d5] mb-8">
          Tap to unlock with Fingerprint
        </Text>

        {/* Fallback to Email/Password Login */}
        <TouchableOpacity
          onPress={() => router.replace('/login')}
          className="py-2.5 px-5 rounded-xl bg-white border border-gray-200"
        >
          <Text className="text-xs font-bold text-[#64748b]">Use Email & Password instead</Text>
        </TouchableOpacity>
      </View>
    );
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