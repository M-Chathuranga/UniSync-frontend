import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenHeader from './shared/ScreenHeader';
import ListItem from './shared/ListItem';

const DATA = [
  { id: '1', iconName: 'person-outline', title: 'Account', subtitle: 'Edit your profile' },
  { id: '2', iconName: 'notifications-outline', title: 'Notifications', subtitle: 'Manage alerts' },
  { id: '3', iconName: 'lock-closed-outline', title: 'Privacy', subtitle: 'Password & security' },
  { id: '4', iconName: 'help-circle-outline', title: 'Help & Support', subtitle: 'FAQs, contact us' },
];

export default function Settings() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem iconName={item.iconName} title={item.title} subtitle={item.subtitle} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});