import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceModal({ visible, onClose, onAddExpense }) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [detectedExpense, setDetectedExpense] = useState(null);

  // Soundwave Animation Values
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  // Pulse animation loop
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim1, {
              toValue: 1.45,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim1, {
              toValue: 1,
              duration: 900,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.7,
              duration: 1100,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 1100,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
    }
  }, [isListening]);

  // Modal එක open වෙද්දී auto listening simulation
  useEffect(() => {
    if (visible) {
      setIsListening(true);
      setSpokenText('');
      setDetectedExpense(null);
    } else {
      setIsListening(false);
    }
  }, [visible]);

  // Voice Parser: Text එකෙන් Amount සහ Category වෙන් කරගැනීම
  const parseExpense = (text) => {
    setSpokenText(text);
    const clean = text.toLowerCase();

    // Amount හඳුනා ගැනීම (උදා: 250, rs 250)
    const match = clean.match(/(?:rs\.?|rupees)?\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = match ? parseFloat(match[1]) : 0;

    // Category හඳුනා ගැනීම
    let category = 'Other';
    let icon = 'receipt';
    if (/(lunch|canteen|food|tea|dinner|breakfast|snack|rice|coffee|kottu)/i.test(clean)) {
      category = 'Food';
      icon = 'restaurant';
    } else if (/(bus|transit|train|ticket|uber|pickme|fuel|petrol)/i.test(clean)) {
      category = 'Transport';
      icon = 'bus';
    } else if (/(boarding|rent|room|hostel)/i.test(clean)) {
      category = 'Boarding';
      icon = 'home';
    } else if (/(book|study|photocopy|pen|print|exam|class)/i.test(clean)) {
      category = 'Study';
      icon = 'book';
    }

    if (amount > 0) {
      setDetectedExpense({
        title: text.trim(),
        amount: amount,
        category: category,
        icon: icon,
      });
    }
  };

  const handleSave = () => {
    if (detectedExpense) {
      onAddExpense(detectedExpense);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[36px] px-6 pt-6 pb-10 items-center shadow-2xl">
          
          {/* Top Drag Indicator */}
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-5" />

          {/* Assistant Title */}
          <Text className="text-xl font-extrabold text-[#0f172a]">Voice Assistant</Text>
          <Text className="text-xs text-[#64748b] mt-1 mb-6 text-center">
            {isListening ? 'Listening for your expense...' : 'Tap the microphone or pick a prompt'}
          </Text>

          {/* Animated Pulsing Mic Wrapper */}
          <View className="items-center justify-center my-4 h-36 w-36">
            {/* Wave 2 */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim2 }],
                opacity: pulseAnim2.interpolate({ inputRange: [1, 1.7], outputRange: [0.35, 0] }),
              }}
              className="absolute w-32 h-32 rounded-full bg-[#4143d5]"
            />
            {/* Wave 1 */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim1 }],
                opacity: pulseAnim1.interpolate({ inputRange: [1, 1.45], outputRange: [0.5, 0.05] }),
              }}
              className="absolute w-24 h-24 rounded-full bg-[#818cf8]"
            />
            {/* Center Mic Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setIsListening(!isListening)}
              className="w-20 h-20 rounded-full bg-[#4143d5] items-center justify-center shadow-xl shadow-[#4143d5]/50 border-4 border-[#e0e7ff]"
              style={{ elevation: 10 }}
            >
              <Ionicons name={isListening ? 'mic' : 'mic-off'} size={36} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Real-time Spoken Text Preview */}
          <View className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl p-3.5 my-3">
            <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Spoken Query:
            </Text>
            <Text className="text-sm font-semibold text-[#0f172a] italic">
              {spokenText ? `"${spokenText}"` : 'Say something like: "Spent 250 for lunch"'}
            </Text>
          </View>

          {/* Detected Expense Card Preview */}
          {detectedExpense && (
            <View className="w-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 my-2 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#d1fae5] items-center justify-center mr-3">
                  <Ionicons name={detectedExpense.icon} size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#065f46]">{detectedExpense.category}</Text>
                  <Text className="text-[11px] text-gray-500">{detectedExpense.title}</Text>
                </View>
              </View>
              <Text className="text-base font-extrabold text-[#047857]">
                - Rs {detectedExpense.amount}
              </Text>
            </View>
          )}

          {/* Quick Voice Demo Suggestions */}
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-2 self-start">
            Quick Test Prompts:
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4 w-full">
            {['Rs 250 for lunch', 'Bus fare 60', 'Rs 350 for books'].map((sample) => (
              <TouchableOpacity
                key={sample}
                onPress={() => parseExpense(sample)}
                className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs"
              >
                <Text className="text-xs text-[#4143d5] font-medium">{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 w-full mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#475569]">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!detectedExpense}
              className={`flex-1 py-3.5 rounded-2xl items-center justify-center shadow-md ${
                detectedExpense ? 'bg-[#4143d5]' : 'bg-gray-300'
              }`}
            >
              <Text className="text-xs font-bold text-white">Save Expense</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}