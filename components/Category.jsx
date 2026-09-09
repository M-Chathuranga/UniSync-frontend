import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const defaultCategories = [
  { id: '1', name: 'Food', emoji: '🍽️', bgColor: '#EEF2FF' },
  { id: '2', name: 'Transport', emoji: '🚌', bgColor: '#ECFDF5' },
  { id: '3', name: 'Boarding', emoji: '🏠', bgColor: '#FEF2F2' },
  { id: '4', name: 'Study', emoji: '📚', bgColor: '#F5F3FF' },
];

const initialCustomCategories = [
  { id: 'c1', name: 'Gaming', emoji: '🎮', bgColor: '#F3F4F6' },
];

export default function CategoryManagement({ onBack }) {
  const [customCategories, setCustomCategories] = useState(initialCustomCategories);

  const handleDelete = (id) => {
    setCustomCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const handleEdit = (id) => {
    console.log('Edit category', id);
  };

  const handleAddNew = () => {
    console.log('Add new category');
  };

  const renderCategoryCard = (item, editable) => (
    <View
      key={item.id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: item.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
      </View>

      <Text style={{ flex: 1, fontSize: 16, color: '#111827' }}>{item.name}</Text>

      {editable && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => handleEdit(item.id)}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text style={{ fontSize: 22, color: '#4F46E5' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#4F46E5' }}>Categories</Text>
        <Text style={{ fontSize: 22 }}>👤</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {defaultCategories.map((item) => renderCategoryCard(item, false))}

        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: '#6B7280',
            letterSpacing: 0.5,
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          CUSTOM CATEGORIES
        </Text>

        {customCategories.map((item) => renderCategoryCard(item, true))}

        <TouchableOpacity
          onPress={handleAddNew}
          style={{
            borderWidth: 1.5,
            borderColor: '#C7D2FE',
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 20,
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 22 }}>➕</Text>
          <Text style={{ color: '#4F46E5', fontWeight: '600', marginTop: 6 }}>
            + Add New Category
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}