import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

export default function SafeToSpendCard({ monthlyBudget, setMonthlyBudget, safeDailyLimit, totalSpentToday }) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Set Monthly Budget</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Safe Daily Limit (30 days): Rs. {safeDailyLimit}</Text>
        <Text style={styles.infoSubText}>Total Spent Today: Rs. {totalSpentToday}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { 
    color: '#1e293b', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  input: { 
    backgroundColor: '#f1f5f9', 
    color: '#0f172a', 
    padding: 12, 
    borderRadius: 10, 
    fontSize: 16 
  },
  infoCard: { 
    backgroundColor: '#e0e7ff', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 20 
  },
  infoTitle: { 
    color: '#3730a3', 
    fontWeight: 'bold', 
    fontSize: 15,
    marginBottom: 4 
  },
  infoSubText: { 
    color: '#312e81', 
    fontWeight: 'bold',
    fontSize: 14 
  },
});