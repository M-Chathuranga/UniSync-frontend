import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function ExpenseInput({ expenseInput, setExpenseInput, onAddExpense }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add Today's Expense</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter expense amount (Rs.)"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        value={expenseInput}
        onChangeText={setExpenseInput}
      />
      <TouchableOpacity style={styles.button} onPress={onAddExpense}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 20,
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
    color: '#243252', 
    padding: 12, 
    borderRadius: 10, 
    fontSize: 15, 
    marginBottom: 12 
  },
  button: { 
    backgroundColor: '#747dea', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});