import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CombinedScreen() {
  // උදාහරණ දත්ත (Categories සහ History සඳහා)
  const categories = ['Technology', 'Education', 'Business', 'Science'];
  const historyItems = ['Scanned QR - 10:00 AM', 'Viewed Item - Yesterday', 'Logged In - 2 days ago'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>UniSync Dashboard</Text>

      {/* Category කොටස */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {categories.map((cat, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>{cat}</Text>
          </View>
        ))}
      </View>

      {/* History කොටස */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        {historyItems.map((hist, index) => (
          <View key={index} style={styles.cardHistory}>
            <Text style={styles.historyText}>{hist}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#475569',
  },
  card: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardHistory: {
    backgroundColor: '#e2e8f0',
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
  },
  historyText: {
    color: '#334155',
    fontSize: 14,
  },
});