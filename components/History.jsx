import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenHeader from './shared/ScreenHeader';
import ListItem from './shared/ListItem';

const DATA = [
  { id: '1', iconName: 'document-text-outline', title: 'Order #1024', subtitle: 'Completed - 12 Aug' },
  { id: '2', iconName: 'document-text-outline', title: 'Order #1019', subtitle: 'Completed - 03 Aug' },
];

export default function History() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="History" />
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