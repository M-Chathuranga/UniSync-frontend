import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { api } from '../../services/api';

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);

  // Reload notifications every time this tab is focused — ensures fresh data per user
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // Fetch all notifications from backend API (GET /notifications)
  // Filtered server-side by req.user.id — cross-user data is never returned
  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data); // Array of { _id, title, message, type, isRead, createdAt }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  };

  // Mark a notification as read on the server then update local state
  const handleMarkRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId); // PATCH /notifications/:id/read
      // Update local state to reflect the read status without a full reload
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  // Mark ALL notifications as read by mapping through and calling API
  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      // Fire all read requests in parallel
      await Promise.all(unread.map((n) => api.markNotificationRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  // Permanently delete a notification from the backend and local state
  const handleDelete = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId); // DELETE /notifications/:id
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (e) {
      console.error('Error deleting notification:', e);
    }
  };

  // Map backend 'type' field to an Ionicons icon and colour
  const getIconConfig = (type) => {
    if (type === 'warning') return { icon: 'warning-outline', color: '#d97706' };
    if (type === 'success') return { icon: 'checkmark-circle-outline', color: '#16a34a' };
    if (type === 'info') return { icon: 'information-circle-outline', color: '#4143d5' };
    return { icon: 'notifications-outline', color: '#4143d5' };
  };

  // Filter notifications in UI based on selected pill
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'Alerts') return item.type === 'warning';
    if (filter === 'Unread') return !item.isRead;
    return true; // 'All'
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-[#0f172a]">Notifications</Text>
            {/* Unread badge */}
            {unreadCount > 0 && (
              <View className="bg-[#4143d5] px-2 py-0.5 rounded-full ml-2">
                <Text className="text-[10px] font-bold text-white">{unreadCount} new</Text>
              </View>
            )}
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text className="text-xs font-semibold text-[#4143d5]">Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View className="flex-row gap-2 mb-4">
          {['All', 'Alerts', 'Unread'].map((item) => {
            const isSelected = filter === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                className={`px-4 py-1.5 rounded-full ${
                  isSelected ? 'bg-[#4143d5]' : 'bg-[#e2e8f0]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-[#64748b]'
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredNotifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-[#ede9fe] items-center justify-center mb-3">
              <Ionicons name="notifications-off-outline" size={28} color="#4143d5" />
            </View>
            <Text className="text-sm font-bold text-[#0f172a]">No notifications</Text>
            <Text className="text-xs text-[#64748b] mt-1">You're completely up to date!</Text>
          </View>
        ) : (
          // Notification cards
          filteredNotifications.map((item) => {
            const { icon, color } = getIconConfig(item.type);
            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.8}
                onPress={() => handleMarkRead(item._id)} // Tap to mark as read
                className={`rounded-2xl p-4 mb-3 border ${
                  item.isRead
                    ? 'bg-white border-[#f1f5f9]'
                    : 'bg-[#f8f9ff] border-[#e0e7ff]'  // Unread has blue-tinted background
                } shadow-sm`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1 mr-2">
                    {/* Type icon */}
                    <View
                      style={{ backgroundColor: `${color}15` }}
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-3 mt-0.5"
                    >
                      <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-[#0f172a] mr-2">
                          {item.title}
                        </Text>
                        {/* Blue dot for unread notifications */}
                        {!item.isRead && (
                          <View className="w-2 h-2 rounded-full bg-[#4143d5]" />
                        )}
                      </View>
                      <Text className="text-xs text-[#64748b] mt-1 leading-4">
                        {item.message}
                      </Text>
                      {/* Timestamp */}
                      <Text className="text-[10px] text-[#94a3b8] mt-2 font-medium">
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Delete button */}
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    className="p-1"
                  >
                    <Ionicons name="close" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}