import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function NotificationTabs({ activeTab, setActiveTab }) {
  return (
    <View style={styles.tabBox}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Recent' && styles.activeTab]}
        onPress={() => setActiveTab('Recent')}
      >
        <Text style={[styles.tabText, activeTab === 'Recent' && styles.activeTabText]}>
          Recent
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'Empty' && styles.activeTab]}
        onPress={() => setActiveTab('Empty')}
      >
        <Text style={[styles.tabText, activeTab === 'Empty' && styles.activeTabText]}>
          Empty State
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBox: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    padding: 3,
    width: 200,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
});