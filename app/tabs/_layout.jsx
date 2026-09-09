import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="add-expense" options={{ href: null }} />
      <Tabs.Screen name="budget-setup" options={{ href: null }} />
    </Tabs>
  );
}