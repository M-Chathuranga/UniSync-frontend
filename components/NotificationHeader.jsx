import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function NotificationHeader({ onClearAll }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Notifications</Text>
      <TouchableOpacity onPress={onClearAll}>
        <Text style={styles.clearText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  clearText: {
    color: '#6366f1',
    fontWeight: '600',
  },
});