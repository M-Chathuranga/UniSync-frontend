import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RecentExpenses({ expenses }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Recent Expenses</Text>

      {expenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No expenses added today.</Text>
        </View>
      ) : (
        expenses.map((item) => (
          <View key={item.id} style={styles.expenseCard}>
            <View style={styles.blueBar} />
            <Text style={styles.expenseTitle}>Expense Added</Text>
            <Text style={styles.expenseAmount}>+ Rs. {item.amount} ({item.time})</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  expenseCard: { 
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  blueBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#5b67f5',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  expenseTitle: { 
    color: '#334155', 
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '500'
  },
  expenseAmount: { 
    color: '#ef4444', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
});