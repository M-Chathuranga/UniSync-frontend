import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Welcome to Smart Finance! 🎉',
      message: 'Your account is now ready. Start logging your daily canteen and transport expenses.',
      time: 'Just now',
      type: 'insight',
      icon: 'sparkles',
      color: '#4143d5',
      read: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'Alerts') return item.type === 'alert';
    if (filter === 'Unread') return !item.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-[#0f172a]">Notifications</Text>
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

        {filteredNotifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-[#ede9fe] items-center justify-center mb-3">
              <Ionicons name="notifications-off-outline" size={28} color="#4143d5" />
            </View>
            <Text className="text-sm font-bold text-[#0f172a]">No notifications</Text>
            <Text className="text-xs text-[#64748b] mt-1">You're completely up to date!</Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <View
              key={item.id}
              className={`rounded-2xl p-4 mb-3 border ${
                item.read
                  ? 'bg-white border-[#f1f5f9]'
                  : 'bg-[#f8f9ff] border-[#e0e7ff]'
              } shadow-sm`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start flex-1 mr-2">
                  <View
                    style={{ backgroundColor: `${item.color}15` }}
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3 mt-0.5"
                  >
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-bold text-[#0f172a] mr-2">
                        {item.title}
                      </Text>
                      {!item.read && (
                        <View className="w-2 h-2 rounded-full bg-[#4143d5]" />
                      )}
                    </View>
                    <Text className="text-xs text-[#64748b] mt-1 leading-4">
                      {item.message}
                    </Text>
                    <Text className="text-[10px] text-[#94a3b8] mt-2 font-medium">
                      {item.time}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => clearNotification(item.id)}
                  className="p-1"
                >
                  <Ionicons name="close" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}