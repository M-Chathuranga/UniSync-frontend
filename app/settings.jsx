import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [dailyAlerts, setDailyAlerts] = useState(true);
  const [voiceLogging, setVoiceLogging] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#312e81" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#475569" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Alex Chen</Text>
          <Text style={styles.profileEmail}>alex.chen@university.edu</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>BUDGET</Text>

      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <MaterialCommunityIcons name="wallet-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Monthly Allowance</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Fixed Costs</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>PREFERENCES</Text>

      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <Ionicons name="notifications-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Daily Limit Alerts</Text>
        <Switch
          value={dailyAlerts}
          onValueChange={setDailyAlerts}
          trackColor={{ false: '#cbd5e1', true: '#4f46e5' }}
          thumbColor={'#0f172a'}
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <Feather name="mic" size={20} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Voice Logging</Text>
        <Switch
          value={voiceLogging}
          onValueChange={setVoiceLogging}
          trackColor={{ false: '#cbd5e1', true: '#4f46e5' }}
          thumbColor={'#0f172a'}
        />
      </View>

      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <Ionicons name="color-palette-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Appearance</Text>
        <View style={styles.rightRow}>
          <Text style={styles.subValueText}>Light</Text>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>ACCOUNT</Text>

      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <Ionicons name="shield-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Privacy & Data</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
          <Ionicons name="help-circle-outline" size={22} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#312e81' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 18, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  profileEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginTop: 15, marginBottom: 10, letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardText: { fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  subValueText: { fontSize: 15, color: '#64748b', marginRight: 6 },
  logoutButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 25, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: 'bold' },
});