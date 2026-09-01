import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Text, Switch, StatusBar } from 'react-native';

import AlertBanner from '../components/AlertBanner.jsx';
import SafeToSpendCard from '../components/SafeToSpendCard.jsx';
import AnalyticsChart from '../components/AnalyticsChart.jsx';
import ExpenseInput from '../components/ExpenseInput.jsx';
import RecentExpenses from '../components/RecentExpenses.jsx';

export default function Index() {
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [expenseInput, setExpenseInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);

  const budgetNum = parseFloat(monthlyBudget) || 0;
  const safeDailyLimit = budgetNum > 0 ? Math.round(budgetNum / 30) : 0;
  const totalSpentToday = expenses.reduce((sum, item) => sum + item.amount, 0);
  const overSpent = totalSpentToday - safeDailyLimit;

  const handleAddExpense = () => {
    const val = parseFloat(expenseInput);
    if (!isNaN(val) && val > 0) {
      const newEntry = {
        id: Date.now(),
        title: 'Expense Added',
        amount: val,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setExpenses([newEntry, ...expenses]);
      setExpenseInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fe" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <AlertBanner overSpent={overSpent} isEnabled={isAlertEnabled} />
        
        <SafeToSpendCard 
          monthlyBudget={monthlyBudget} 
          setMonthlyBudget={setMonthlyBudget} 
          safeDailyLimit={safeDailyLimit} 
          totalSpentToday={totalSpentToday} 
        />
        
        <AnalyticsChart safeDailyLimit={safeDailyLimit} totalSpentToday={totalSpentToday} />
        
        <ExpenseInput 
          expenseInput={expenseInput} 
          setExpenseInput={setExpenseInput} 
          onAddExpense={handleAddExpense} 
        />
        
        <RecentExpenses expenses={expenses} />

        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.prefCard}>
          <Text style={styles.prefText}>Daily Limit Alerts</Text>
          <Switch 
            value={isAlertEnabled} 
            onValueChange={setIsAlertEnabled}
            trackColor={{ false: '#dcdfe6', true: '#5b67f5' }}
            thumbColor={'#ffffff'}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fe' 
  },
  scrollContent: { 
    padding: 16, 
    paddingTop: 40,
    paddingBottom: 40 
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 10,
  },
  prefCard: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  prefText: { 
    color: '#1e293b', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});