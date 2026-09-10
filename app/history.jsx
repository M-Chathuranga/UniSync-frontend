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
        <Text style={styles.totalAmount}>Rs 4,860</Text>
        <Text style={styles.summarySub}>Spent in July · 24 transactions</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity style={[styles.chip, styles.activeChip]}>
          <Text style={styles.activeChipText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip}>
          <Text style={styles.chipText}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip}>
          <Text style={styles.chipText}>Transport</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip}>
          <Text style={styles.chipText}>Fixed</Text>
        </TouchableOpacity>
      </ScrollView>

      <Text style={styles.dateHeader}>TODAY · TUE 14</Text>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#eef2ff' }]}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#6366f1" />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>Campus Cafe</Text>
          <Text style={styles.cardSub}>Food · 12:30 PM</Text>
        </View>
        <Text style={styles.amountRed}>-Rs 200</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
          <Ionicons name="bus-outline" size={22} color="#22c55e" />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>City Transit</Text>
          <Text style={styles.cardSub}>Transport · 08:15 AM</Text>
        </View>
        <Text style={styles.amountRed}>-Rs 45</Text>
      </View>

      <Text style={styles.dateHeader}>YESTERDAY · MON 13</Text>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#fae8ff' }]}>
          <MaterialCommunityIcons name="shopping-outline" size={22} color="#d946ef" />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>Stationery Store</Text>
          <Text style={styles.cardSub}>Supplies · 04:20 PM</Text>
        </View>
        <Text style={styles.amountRed}>-Rs 350</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#fff1f2' }]}>
          <MaterialCommunityIcons name="coffee-outline" size={22} color="#f43f5e" />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>Library Coffee</Text>
          <Text style={styles.cardSub}>Food · 10:00 AM</Text>
        </View>
        <Text style={styles.amountRed}>-Rs 120</Text>
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
  summaryContainer: { alignItems: 'center', marginVertical: 15 },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#0f172a' },
  summarySub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  filterRow: { flexDirection: 'row', marginVertical: 10 },
  chip: { backgroundColor: '#e2e8f0', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 36, justifyContent: 'center' },
  activeChip: { backgroundColor: '#4f46e5' },
  activeChipText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  chipText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  dateHeader: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginTop: 20, marginBottom: 8, letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 16, marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardDetails: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  amountRed: { fontSize: 15, fontWeight: 'bold', color: '#dc2626' },
});