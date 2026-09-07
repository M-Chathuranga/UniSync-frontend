import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenHeader from './shared/ScreenHeader';
import ListItem from './shared/ListItem';

const DATA = [
  { id: '1', iconName: 'person-circle-outline', title: 'New message request', subtitle: '2 min ago' },
  { id: '2', iconName: 'checkmark-done-outline', title: 'Task approved', subtitle: '1 hour ago' },
  { id: '3', iconName: 'alert-circle-outline', title: 'Reminder: submit report', subtitle: 'Yesterday' },
];

export default function Notification() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Notification" />
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