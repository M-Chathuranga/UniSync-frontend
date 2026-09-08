import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>Home</Text>
    </View>
  );
}