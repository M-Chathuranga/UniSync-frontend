import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';

export default function SettingsScreen() {
  const [dailyLimitAlerts, setDailyLimitAlerts] = useState(true);
  const [voiceLogging, setVoiceLogging] = useState(true);

  const renderRow = ({ emoji, label, value, showChevron = true }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#EEF2FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: '#111827' }}>{label}</Text>
      {value && (
        <Text style={{ fontSize: 14, color: '#6B7280', marginRight: 6 }}>{value}</Text>
      )}
      {showChevron && <Text style={{ fontSize: 18, color: '#9CA3AF' }}>›</Text>}
    </TouchableOpacity>
  );

  const renderToggleRow = ({ emoji, label, value, onToggle }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#EEF2FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: '#111827' }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={{ marginBottom: 20 }}>
      {title && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: '#6B7280',
            letterSpacing: 0.5,
            marginBottom: 10,
            marginLeft: 4,
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {children}
      </View>
    </View>
  );

  const Divider = () => (
    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 66 }} />
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
        <Text style={{ fontSize: 22, color: '#4F46E5' }}>←</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#4F46E5' }}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 24 }}>🙂</Text>
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }}>Alex Chen</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              alex.chen@university.edu
            </Text>
          </View>
        </View>

        <Section title="BUDGET">
          {renderRow({ emoji: '💳', label: 'Monthly Allowance' })}
          <Divider />
          {renderRow({ emoji: '📋', label: 'Fixed Costs' })}
        </Section>

        <Section title="PREFERENCES">
          {renderToggleRow({
            emoji: '🔔',
            label: 'Daily Limit Alerts',
            value: dailyLimitAlerts,
            onToggle: setDailyLimitAlerts,
          })}
          <Divider />
          {renderToggleRow({
            emoji: '🎙️',
            label: 'Voice Logging',
            value: voiceLogging,
            onToggle: setVoiceLogging,
          })}
          <Divider />
          {renderRow({ emoji: '🎨', label: 'Appearance', value: 'Light' })}
        </Section>

        <Section title="ACCOUNT">
          {renderRow({ emoji: '🛡️', label: 'Privacy & Data' })}
          <Divider />
          {renderRow({ emoji: '❓', label: 'Help & Support' })}
        </Section>

        <TouchableOpacity
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#DC2626' }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}