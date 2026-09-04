import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* App Title */}
        <Text style={styles.title}>Smart Finance</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <Text style={{ fontSize: 30 }}>👤</Text>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.name}>Alex Chen</Text>
            <Text style={styles.subText}>University Student</Text>
            <Text style={styles.tag}>Premium Account</Text>
          </View>
        </View>

        {/* Menu Buttons */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.btnText}>🎛️ Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.btnText}>📊 Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.btnText}>📑 Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.btnText}>⚙️ Settings</Text>
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity 
          style={styles.activeButton}
          onPress={() => router.push('/notifications')}
        >
          <Text style={styles.activeBtnText}>🔔 Notifications</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 11,
    color: '#64748b',
  },
  tag: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  activeButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});