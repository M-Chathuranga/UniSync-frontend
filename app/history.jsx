import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#1e1b4b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-sharp" size={20} color="#1e1b4b" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.totalAmount}>Rs 0</Text>
        <Text style={styles.summarySub}>No transactions yet</Text>
      </View>

      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="receipt" size={50} color="#cbd5e1" />
        <Text style={styles.emptyText}>Your expense history will appear here</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#312e81' },
  settingsBtn: { backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryContainer: { alignItems: 'center', marginVertical: 20 },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#0f172a' },
  summarySub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#64748b', fontSize: 14, marginTop: 12 },
});