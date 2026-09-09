import React from 'react';
import { router } from 'expo-router';
import CategoryManagement from '../components/Category';

export default function CategoriesScreen() {
  return <CategoryManagement onBack={() => router.back()} />;
}