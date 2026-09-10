import "./global.css";
import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  useEffect(() => {
    async function hideSystemBars() {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("inset-swipe");
        StatusBar.setHidden(true);
      } catch (e) {
        console.log(e);
      }
    }
    hideSystemBars();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}