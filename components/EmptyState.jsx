import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function EmptyState() {
  const router = useRouter();

  return (
    <View style={styles.emptyBox}>
      <Text style={{ fontSize: 45 }}>🔔</Text>
      <Text style={styles.title}>No Notifications</Text>
      <Text style={styles.sub}>You're all caught up!</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/')}
      >
        <Text style={styles.btnText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  sub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});