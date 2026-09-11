import './global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="budget-setup" />
        <Stack.Screen name="expense-success" />
        <Stack.Screen name="transaction-detail" />
      </Stack>
    </SafeAreaProvider>
  );
}