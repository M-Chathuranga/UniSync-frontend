import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AlertBanner({ overSpent, isEnabled }) {
  if (!isEnabled || overSpent <= 0) return null;

  return (
    <View style={styles.alertCard}>
      <Text style={styles.alertTitle}>⚠️ Daily Limit Exceeded</Text>
      <Text style={styles.alertText}>
        You are Rs. {overSpent} over your safe spending limit today!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alertCard: { 
    backgroundColor: '#ffebee', 
    padding: 16, 
    borderRadius: 14, 
    borderWidth: 1,
    borderColor: '#ffcdd2',
    marginBottom: 15 
  },
  alertTitle: { 
    color: '#c62828', 
    fontWeight: 'bold', 
    fontSize: 16,
    marginBottom: 4
  },
  alertText: { 
    color: '#d32f2f', 
    fontSize: 14 
  },
});