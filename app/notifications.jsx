import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, SafeAreaView } from 'react-native';

import NotificationHeader from '../components/NotificationHeader';
import NotificationTabs from '../components/NotificationTabs';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState('Recent');
  const [showData, setShowData] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.paddingView}>
        
        <NotificationHeader onClearAll={() => setShowData(false)} />
        <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'Empty' || !showData ? (
          <EmptyState />
        ) : (
          <View>
            <Text style={styles.sectionTitle}>TODAY</Text>
            
            <NotificationCard
              title="Daily limit exceeded"
              time="10:42 AM"
              desc="You've spent Rs 400.00 over your daily food budget."
              icon="🔔"
              iconBg="#fee2e2"
              category="Food & Dining"
            />

            <NotificationCard
              title="Goal milestone reached"
              time="08:15 AM"
              desc='You saved 50% towards your "Summer Trip" goal.'
              icon="🐷"
              iconBg="#e0e7ff"
            />

            <Text style={styles.sectionTitle}>EARLIER</Text>

            <NotificationCard
              title="Unusual transaction detected"
              time="Yesterday"
              desc='A charge of Rs 200.00 from "TechStore" was flagged.'
              icon="⚠️"
              iconBg="#fee2e2"
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  paddingView: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    marginVertical: 8,
  },
});