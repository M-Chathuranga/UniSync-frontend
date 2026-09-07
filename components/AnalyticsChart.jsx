import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

export default function AnalyticsChart({ safeDailyLimit, totalSpentToday }) {
  const chartData = {
    labels: ['Safe Limit', 'Total Spent'],
    datasets: [{ data: [safeDailyLimit, totalSpentToday] }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Spending Analytics</Text>
      <View style={styles.card}>
        <BarChart
          data={chartData}
          width={screenWidth - 20}
          height={200}
          yAxisLabel="Rs."
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(34, 197,94, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(30, 41, 22, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: '4',
              stroke: '#e2e8f0'
            }
          }}
          style={styles.chart}
          fromZero={true}
          showBarTops={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#071327',
    marginBottom: 10,
  },
  card: { 
    backgroundColor: 'white', 
    paddingVertical: 10,
    borderRadius: 14, 
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  chart: { 
    borderRadius: 14 
  },
});