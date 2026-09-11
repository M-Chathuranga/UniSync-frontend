import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CategoriesScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#1e1b4b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-sharp" size={20} color="#1e1b4b" />
        </TouchableOpacity>
      </View>

      {/* Default Categories */}
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#eef2ff' }]}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#6366f1" />
        </View>
        <Text style={styles.cardText}>Food</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
          <Ionicons name="bus-outline" size={24} color="#22c55e" />
        </View>
        <Text style={styles.cardText}>Transport</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#fff1f2' }]}>
          <Ionicons name="home-outline" size={24} color="#f43f5e" />
        </View>
        <Text style={styles.cardText}>Boarding</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
          <Ionicons name="book-outline" size={24} color="#a855f7" />
        </View>
        <Text style={styles.cardText}>Study</Text>
      </View>

      {/* Custom Categories Section */}
      <Text style={styles.sectionTitle}>CUSTOM CATEGORIES</Text>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: '#f1f5f9' }]}>
          <Ionicons name="game-controller-outline" size={24} color="#475569" />
        </View>
        <Text style={styles.cardText}>Gaming</Text>
        <TouchableOpacity style={{ marginRight: 16 }}>
          <Ionicons name="pencil" size={18} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Add New Category Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={22} color="#4f46e5" />
        <Text style={styles.addButtonText}>+ Add New Category</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 16, 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#312e81' 
  },
  settingsBtn: { 
    backgroundColor: '#e2e8f0', 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#64748b', 
    marginTop: 24, 
    marginBottom: 10, 
    letterSpacing: 0.5 
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    padding: 16, 
    borderRadius: 16, 
    marginVertical: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 4, 
    elevation: 2 
  },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  cardText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b', 
    flex: 1 
  },
  addButton: { 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#cbd5e1', 
    borderRadius: 16, 
    padding: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    marginTop: 15, 
    backgroundColor: 'transparent' 
  },
  addButtonText: { 
    color: '#4f46e5', 
    fontWeight: 'bold', 
    fontSize: 15, 
    marginLeft: 6 
  },
});