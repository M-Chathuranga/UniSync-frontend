import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 }}>Home</Text>

      <TouchableOpacity
        onPress={() => router.push('/categories')}
        style={{ backgroundColor: '#4F46E5', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Go to Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/history')}
        style={{ backgroundColor: '#4F46E5', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Go to History</Text>
      </TouchableOpacity>
    </View>
  );
}