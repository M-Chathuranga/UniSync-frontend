import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: '#4143d5',
          tabBarInactiveTintColor: '#767586',
          tabBarStyle: {
           position: 'absolute',
           bottom: 0,
           left: 0,
           right: 0,
           backgroundColor: '#ffffff',
           borderTopWidth: 1,
           borderTopColor: '#f1f5f9',
           height: 64 + Math.max(insets.bottom, 10),
           paddingBottom: Math.max(insets.bottom, 10),
           paddingTop: 8,
           elevation: 10,
            borderTopWidth: 0,
            backgroundColor: '#ffffff',
            shadowColor: '#4143d5',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'pie-chart' : 'pie-chart-outline'} color={color} focused={focused} />
            ),
          }}
        />

        {/* මැද + Button එක (එබුවම උඩින් Voice සහ Transaction buttons මතුවේ) */}
        <Tabs.Screen
          name="add-placeholder"
          options={{
            tabBarButton: () => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setMenuOpen(!menuOpen)}
                style={styles.centerButtonWrapper}
              >
                <View style={[styles.centerButton, menuOpen && styles.centerButtonActive]}>
                  <Ionicons name={menuOpen ? 'close' : 'add'} size={28} color="#ffffff" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'receipt' : 'receipt-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'notifications' : 'notifications-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* + Button එක එබුවම උඩින් මතුවෙන Buttons 2 (Voice සහ Transaction) */}
      {menuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />

          <View style={[styles.fabMenuContainer, { bottom: bottomOffset + 78 }]}>
            {/* 1. Voice Mic Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.subButtonWrapper}
              onPress={() => {
                setMenuOpen(false);
                router.push({ pathname: '/tabs', params: { action: 'voice', t: Date.now().toString() } });
              }}
            >
              <View style={[styles.subButton, { backgroundColor: '#6366f1' }]}>
                <Ionicons name="mic" size={24} color="#ffffff" />
              </View>
              <Text style={styles.subButtonLabel}>Voice</Text>
            </TouchableOpacity>

            {/* 2. Manual Transaction Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.subButtonWrapper}
              onPress={() => {
                setMenuOpen(false);
                router.push({ pathname: '/tabs', params: { action: 'manual', t: Date.now().toString() } });
              }}
            >
              <View style={[styles.subButton, { backgroundColor: '#4143d5' }]}>
                <Ionicons name="add" size={26} color="#ffffff" />
              </View>
              <Text style={styles.subButtonLabel}>Transaction</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function TabIcon({ name, color, focused }) {
  return (
    <View
      className={`w-11 h-9 rounded-2xl items-center justify-center mt-3 ${
        focused ? 'bg-[#e1e0ff]' : 'bg-transparent'
      }`}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4143d5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f7f9fb',
    shadowColor: '#4143d5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  centerButtonActive: {
    backgroundColor: '#1e1b4b',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    zIndex: 10,
  },
  fabMenuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 32,
    zIndex: 20,
    alignItems: 'center',
  },
  subButtonWrapper: {
    alignItems: 'center',
  },
  subButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  subButtonLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#1e1b4b',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
});